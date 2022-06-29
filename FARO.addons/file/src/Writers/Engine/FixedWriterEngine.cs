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
    public class FixedWriterEngine : IWriterEngine {

        private readonly IExpressionEvaluator _expressionEvaluator;

        public FixedWriterEngine(IExpressionEvaluator expressionEvaluator) {
            _expressionEvaluator = expressionEvaluator;
        }

        public IEnumerable<FieldDescription> GetFields(WriterDefinition writerDefinition) {
            var fields = writerDefinition.Config.As<FixedConfig>()?.Fields;
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
            var cfg = writer.Definition.Config.As<FixedConfig>();
            var fileOut = args?.ContainsKey("file") ?? false ? MiscHelper.GetValueOrNull(args["file"]?.ToString()) : null;
            var culture = args?.ContainsKey("culture") ?? false ? MiscHelper.GetValueOrNull(args["culture"]?.ToString()) : null;
            var writerCulture = GetCulture(culture ?? cfg?.Culture);
            var writerEncoding = GetEncoding(cfg?.Encoding);

            if ((cfg?.Fields?.Any() ?? false) && cfg.Length > 0) {
                var outputWriter = new FormatStreamWriter(writerStream.Stream, writerEncoding, writerCulture);
                output?.IterateRows(row => outputWriter.WriteLine(CreateRow(cfg, writerCulture, row)));
                outputWriter.Flush();
            }
            return new WriterStreamInfo { ContentType = MediaTypeNames.Text.Plain, FileName = fileOut, FileExtension = "txt" };
        }

        string CreateRow(FixedConfig config, CultureInfo culture, ImageOutputRow row) {
            var result = new StringBuilder(config.Length);
            foreach (var field in config.Fields!.OrderBy(f => f.Start)) {
                if (row.ContainsName(field.Name)) {
                    var fieldValue = row.GetValueExact(field.Name);

                    // evaluate 'when' condition
                    if (!MiscHelper.IsNullOrEmpty(field.When) && !_expressionEvaluator.EvalCondition(field.When, row)) fieldValue = null;

                    if (!string.IsNullOrEmpty(field.Type)) fieldValue = ChangeType(fieldValue, field.Type, culture);
                    var format = !string.IsNullOrEmpty(field.Format) ? "{0:" + field.Format + "}" : "{0}";

                    switch (field.Type?.ToLower() ?? "string") {
                        case "string":
                        case "datetime":
                            result.Insert(field.Start - 1, string.Format(format, fieldValue ?? string.Empty).PadRight(field.Length, ' '));
                            break;
                        default:
                            if (fieldValue == null) fieldValue = new string(' ', field.Length);
                            else {
                                var numValue = (dynamic)fieldValue * (decimal)Math.Pow(10, field.VirtualDec);
                                fieldValue = numValue.ToString(string.IsNullOrEmpty(field.Format) ? new string('0', field.Length) : field.Format, culture);
                            }
                            result.Insert(field.Start - 1, ((string)fieldValue).PadLeft(field.Length, '0'));
                            break;
                    }
                } else {
                    throw new ApplicationException($"Cannot find field name: {field.Name}");
                }
            }
            var fixedRow = result.ToString();
            if (fixedRow.Length + 1 != config.Length) throw new ArgumentException(string.Format($"File length error! Expected:{config.Length} Found:{fixedRow.Length + 1}"));
            return result.ToString();
        }
    }
}
