using System.Globalization;
using System.Net.Mime;

using FARO.Addons.Common.Extensions;
using FARO.Common;
using FARO.Common.Domain;
using FARO.Common.Helpers;

using Newtonsoft.Json;

using FileIO = System.IO.File;
using static FARO.Addons.Common.DynamicHelper;
using static FARO.Addons.Common.StringHelper;

namespace FARO.Addons.File.Writers.Engine {
    public class JsonWriterEngine : IWriterEngine {
        private readonly IExpressionEvaluator _expressionEvaluator;

        public JsonWriterEngine(IExpressionEvaluator expressionEvaluator) {
            _expressionEvaluator = expressionEvaluator;
        }

        public IEnumerable<FieldDescription> GetFields(WriterDefinition writerDefinition) {
            var fields = writerDefinition.Config.As<JsonConfig>()?.Fields;
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
            var cfg = writer.Definition.Config.As<JsonConfig>();
            var fileOut = args?.ContainsKey("file") ?? false ? MiscHelper.GetValueOrNull(args["file"]?.ToString()) : null;
            var culture = args?.ContainsKey("culture") ?? false ? MiscHelper.GetValueOrNull(args["culture"]?.ToString()) : null;
            var writerCulture = GetCulture(culture ?? cfg?.Culture);
            var writerEncoding = GetEncoding(cfg?.Encoding);

            if (cfg?.Fields?.Any() ?? false) {
                var outputWriter = new FormatStreamWriter(writerStream.Stream, writerEncoding, writerCulture);
                var rows = new List<IDictionary<string, object?>>();
                output?.IterateRows(row => rows.Add(CreateRow(cfg, writerCulture, row)));
                outputWriter.WriteLine(JsonConvert.SerializeObject(rows, Formatting.Indented));
                outputWriter.Flush();
            }
            return new WriterStreamInfo { ContentType = MediaTypeNames.Application.Json, FileName = fileOut, FileExtension = "json" };
        }

        IDictionary<string, object?> CreateRow(JsonConfig config, CultureInfo culture, ImageOutputRow row) {
            var rowToSerialize = new Dictionary<string, object?>();
            var fieldIndex = 0;
            foreach (var field in config.Fields!) {
                if (row.ContainsName(field.Name)) {
                    var outFieldName = field.Label ?? field.Name ?? $"UNNAMED_FIELD_{fieldIndex}";
                    var fieldValue = row.GetValueExact(field.Name);

                    // evaluate 'when' condition
                    if (!MiscHelper.IsNullOrEmpty(field.When) && !_expressionEvaluator.EvalCondition(field.When, row)) fieldValue = null;

                    if (fieldValue == null) {
                        rowToSerialize.Add(outFieldName, null);
                    } else {
                        if (!string.IsNullOrEmpty(field.Type)) fieldValue = ChangeType(fieldValue, field.Type, culture);
                        if (!string.IsNullOrEmpty(field.Format)) {
                            var format = !string.IsNullOrEmpty(field.Format) ? "{0:" + field.Format + "}" : "{0}";
                            rowToSerialize.Add(outFieldName, string.Format(culture, format, fieldValue));
                        } else {
                            rowToSerialize.Add(outFieldName, fieldValue);
                        }
                    }
                } else {
                    throw new ApplicationException($"Cannot find field name: {field.Name}");
                }
            }
            return rowToSerialize;
        }
    }
}
