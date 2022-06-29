using System.Globalization;
using System.Net.Mime;
using System.Text;

using FARO.Addons.Common.Extensions;
using FARO.Common;
using FARO.Common.Domain;
using FARO.Common.Helpers;

using FileIO = System.IO.File;
using static FARO.Addons.Common.DynamicHelper;
using static FARO.Addons.Common.StringHelper;

namespace FARO.Addons.File.Writers.Engine {
    public class DelimitedWriterEngine : IWriterEngine {
        const char DEFAULT_DELIM_CHAR = ',';
        private readonly IExpressionEvaluator _expressionEvaluator;

        public DelimitedWriterEngine(IExpressionEvaluator expressionEvaluator) {
            _expressionEvaluator = expressionEvaluator;
        }

        public IEnumerable<FieldDescription> GetFields(WriterDefinition writerDefinition) {
            var fields = writerDefinition.Config.As<DelimitedConfig>()?.Fields;
            var ret = new HashSet<FieldDescription>();
            if (fields != null) {
                foreach (var field in fields) {
                    ret.Add(FieldDescription.Create(field.Name));
                    _expressionEvaluator.ForEachField(field.When, (f, o, a) => ret.Add(FieldDescription.Create(f, $"When: {field.When}")));
                }
            }
            return ret;
        }

        public void WriteAll(IWriter writer, IImageOutput output, IDataResourceService dataResource, IDictionary<string, object>? args) {
            var fileOut = args?.ContainsKey("file") ?? false ? MiscHelper.GetValueOrNull(args["file"]?.ToString()) : null;
            if (fileOut is null) return;
            if (FileIO.Exists(fileOut)) FileIO.Delete(fileOut);
            using var fileStream = new FileStream(fileOut, FileMode.Create);
            using var bufferedFile = new BufferedStream(fileStream);
            var writerStream = new WriterStream(bufferedFile);
            WriteAllToStream(writer, output, writerStream, dataResource, args);
        }

        public WriterStreamInfo WriteAllToStream(IWriter writer, IImageOutput output, WriterStream writerStream, IDataResourceService dataResource, IDictionary<string, object>? args) {
            var cfg = writer.Definition.Config.As<DelimitedConfig>();
            var fileOut = args?.ContainsKey("file") ?? false ? MiscHelper.GetValueOrNull(args["file"]?.ToString()) : null;
            var culture = args?.ContainsKey("culture") ?? false ? MiscHelper.GetValueOrNull(args["culture"]?.ToString()) : null;
            var writerCulture = GetCulture(culture ?? cfg?.Culture);
            var writerEncoding = GetEncoding(cfg?.Encoding);
            var delimiter = cfg?.Delim ?? DEFAULT_DELIM_CHAR;

            if (cfg?.Fields?.Any() ?? false) {
                var outputWriter = new FormatStreamWriter(writerStream.Stream, writerEncoding, writerCulture);
                if (cfg.IncludeHeader ?? false) outputWriter.WriteLine(cfg.Fields.Aggregate(string.Empty, (a, c) => a += (c.Label ?? c.Name) + delimiter).TrimEnd(delimiter));
                output?.IterateRows(row => outputWriter.WriteLine(CreateRow(cfg.Fields, delimiter, writerCulture, row)));
                outputWriter.Flush();
            }
            return new WriterStreamInfo { ContentType = MediaTypeNames.Text.Plain, FileName = fileOut, FileExtension = "txt" };
        }

        string CreateRow(DelimitedConfigField[] fields, char delimiter, CultureInfo culture, ImageOutputRow row) {
            var result = new StringBuilder();
            foreach (var field in fields.OrderBy(f => f.Order)) {
                if (row.ContainsName(field.Name)) {
                    var fieldValue = row.GetValueExact(field.Name);

                    // evaluate 'when' condition
                    if (!MiscHelper.IsNullOrEmpty(field.When) && !_expressionEvaluator.EvalCondition(field.When, row)) fieldValue = null;

                    if (fieldValue == null) {
                        result.Append(field.Quote).Append(field.Quote).Append(delimiter);
                    } else {
                        if (!string.IsNullOrEmpty(field.Type)) fieldValue = ChangeType(fieldValue, field.Type, culture);
                        var format = !string.IsNullOrEmpty(field.Format) ? "{0:" + field.Format + "}" : "{0}";
                        result.Append(field.Quote)
                              .AppendFormat(culture, format, fieldValue)
                              .Append(field.Quote)
                              .Append(delimiter);
                    }
                } else {
                    throw new ApplicationException($"Cannot find field name: {field.Name}");
                }
            }
            var ret = result.ToString();
            return ret.Remove(ret.Length - 1);
        }
    }
}
