using FARO.Addons.File.Extensions;
using FARO.Common;
using FARO.Common.Exceptions;
using FARO.Common.Helpers;

using FileIO = System.IO.File;
using static FARO.Addons.Common.StringHelper;
using static FARO.Addons.Common.DynamicHelper;
namespace FARO.Addons.File.KeysIterators.Engine {
    public class DelimitedKeysIteratorEngine : IKeysIteratorEngine {

        private readonly IExpressionEvaluator _expressionEvaluator;

        public DelimitedKeysIteratorEngine(IExpressionEvaluator expressionEvaluator) {
            _expressionEvaluator = expressionEvaluator;
        }

        public IEnumerable<IDictionary<string, object?>> GetKeys(IKeysIterator keysIterator, IDictionary<string, object> args, IDataResourceService dataResource) {
            var source = DelimitedSource.CreateFromDefinition(keysIterator.Definition.Source);
            if (!(source.Fields?.Any() ?? false)) yield break;
            var path = source.Path;
            var searchPath = source.SearchPath;
            var where = source.Where;
            if (keysIterator.Definition.Arguments != null) {
                foreach (var arg in keysIterator.Definition.Arguments) {
                    var argSel = keysIterator.GetArgumentName(arg.Name);
                    var argValue = args.ContainsKey(argSel) ? args[argSel] : null;
                    if (!arg.Optional && argValue == null) throw new NullArgumentValueException(keysIterator, argSel != arg.Name ? $"{arg.Name} as {argSel}" : argSel, args);
                    path = path?.Replace("{" + arg.Name + "}", argValue?.ToString() ?? string.Empty);
                    searchPath = searchPath?.Replace("{" + arg.Name + "}", argValue?.ToString() ?? string.Empty);
                    if (where != null && argValue != null) where = where.Replace("{" + arg.Name + "}", argValue.ToString());
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
                    var index = 0;
                    foreach (var field in source.Fields) {
                        row.Add(field, index < csvRow.Count ? csvRow[index] : null);
                        index += 1;
                    }
                    if (_expressionEvaluator.EvalCondition(where, row)) {
                        yield return CreateResultRow(keysIterator, row);
                    }
                }
            }
        }

        private static Dictionary<string, object?> CreateResultRow(IKeysIterator keysIterator, Dictionary<string, object?> row) {
            var fieldValues = new Dictionary<string, object?>();
            foreach (var field in keysIterator.Definition.Fields) {
                object? fieldValue = null;
                if (field.Value != null) {
                    fieldValue = ChangeType(field.Value, field.Type);
                } else {
                    if (row.ContainsKey(field.SelectorOrName)) fieldValue = ChangeType(row[field.SelectorOrName], field.Type);
                }
                if (fieldValue != null && !MiscHelper.IsNullOrEmpty(field.Format)) fieldValue = string.Format("{0:" + field.Format + "}", fieldValue);
                fieldValues.Add(keysIterator.GetOutputFieldName(field.Name), fieldValue);
            }
            return fieldValues;
        }
    }
}
