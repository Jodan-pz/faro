using FARO.Addons.File.Extensions;
using FARO.Common;
using FARO.Common.Exceptions;
using FARO.Common.Helpers;

using FileIO = System.IO.File;
using static FARO.Addons.Common.StringHelper;
using static FARO.Addons.Common.DynamicHelper;

namespace FARO.Addons.File.Decorators.Engine {
    public class DelimitedDecoratorEngine : IDecoratorEngine {
        private readonly IExpressionEvaluator _expressionEvaluator;

        public DelimitedDecoratorEngine(IExpressionEvaluator expressionEvaluator) {
            _expressionEvaluator = expressionEvaluator;
        }

        public Task<IDictionary<string, object?>> GetValuesAsync(IDecorator decorator, ImageOutputRow imageOutputRow, IDataResourceService dataResource) {
            Dictionary<string, object?> ret = new();
            var source = DelimitedSource.CreateFromDefinition(decorator.Definition.Source);
            if (!(source.Fields?.Any() ?? false)) return Task.FromResult<IDictionary<string, object?>>(ret);
            var path = source.Path;
            var searchPath = source.SearchPath;
            var where = source.Where;
            var dicArgValues = new Dictionary<string, object?>();
            if (decorator.Arguments?.Any() ?? false) {
                foreach (var arg in decorator.Arguments) {
                    var argValue = imageOutputRow.GetValue(arg.Value ?? $"{{{arg.Name}}}");
                    if (!arg.Optional && argValue == null) throw new NullArgumentValueException(decorator, arg.Name, imageOutputRow);
                    path = path?.Replace("{" + arg.Name + "}", argValue?.ToString() ?? string.Empty);
                    searchPath = searchPath?.Replace("{" + arg.Name + "}", argValue?.ToString() ?? string.Empty);
                    if (where != null && argValue != null) where = where.Replace("{" + arg.Name + "}", argValue.ToString());
                    dicArgValues.Add(arg.Name, argValue);
                }

                if (!_expressionEvaluator.EvalCondition(decorator.Definition.When, dicArgValues)) {
                    FillEmptyResult(decorator, ret);
                    return Task.FromResult<IDictionary<string, object?>>(ret);
                }
            }

            path = dataResource.GetResourcePath(path);

            var files = Directory.GetFiles(path, searchPath ?? "*.*", SearchOption.TopDirectoryOnly);
            var encoding = GetEncoding(source.Encoding);

            foreach (var file in files) {
                using var stream = FileIO.OpenRead(file);
                using var reader = new StreamReader(stream, encoding);
                foreach (var csvRow in reader.DelimitedBy(source.Delim, source.SkipHeader ?? false)) {
                    var row = new Dictionary<string, object?>();
                    var fieldsCount = source.Fields.Count();
                    var index = 0;
                    foreach (var field in source.Fields) {
                        row.Add(field, index < csvRow.Count ? csvRow[index] : null);
                        index += 1;
                    }
                    if (_expressionEvaluator.EvalCondition(where, row)) {
                        ret = CreateResultRow(decorator, row);
                        break;
                    }
                }
            }
            if (!ret.Any()) {
                FillEmptyResult(decorator, ret);
            }
            return Task.FromResult<IDictionary<string, object?>>(ret);
        }

        private static Dictionary<string, object?> CreateResultRow(IDecorator decorator, Dictionary<string, object?> row) {
            var ret = new Dictionary<string, object?>();
            if (!(decorator.Definition.Fields?.Any() ?? false)) {
                ret.Add("result", row[row.Keys.First()]);
            } else {
                foreach (var field in decorator.Definition.Fields) {
                    object? fieldValue = null;
                    if (field.Value != null) {
                        fieldValue = ChangeType(field.Value, field.Type);
                    } else {
                        if (row.ContainsKey(field.SelectorOrName)) fieldValue = ChangeType(row[field.SelectorOrName], field.Type);
                    }
                    if (fieldValue != null && !MiscHelper.IsNullOrEmpty(field.Format)) fieldValue = string.Format("{0:" + field.Format + "}", fieldValue);

                    ret.Add(field.Name, fieldValue);
                }
            }
            return ret;
        }

        static void FillEmptyResult(IDecorator decorator, IDictionary<string, object?> result) {
            foreach (var field in decorator.Definition.Fields) {
                result.Add(field.Name, null);
            }
        }
    }
}
