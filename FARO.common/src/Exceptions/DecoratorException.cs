using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;

namespace FARO.Common.Exceptions {
    public class DecoratorException : Exception {
        public DecoratorException(string message) : base(message) { }
        public DecoratorException(string message, Exception innerException) : base(message, innerException) { }

        public DecoratorException(IDecorator decorator, ImageOutputRow row, LayerFieldItem fieldItem, Exception innerException)
        : this(BuildMessage(decorator, row, new LayerFieldItem[] { fieldItem }, innerException)) { }

        public DecoratorException(IDecorator decorator, ImageOutputRow row, ILayer layer, Exception innerException)
        : this(BuildMessage(decorator, row, layer, innerException)) { }

        private static string BuildMessage(IDecorator decorator, ImageOutputRow row, ILayer layer, Exception innerException) {
            var fieldItems = layer.Items.Where(DecoratorHashKeyComparer.Compare(decorator));
            return BuildMessage(decorator, row, fieldItems, innerException);
        }

        private static string BuildMessage(IDecorator decorator, ImageOutputRow row, IEnumerable<LayerFieldItem> fieldItems, Exception innerException) {
            var layer = fieldItems?.First().Layer;

            var sb = new StringBuilder();
            sb.AppendLine("-=== DECORATOR ERROR DETAILS ===-");
            sb.AppendLine($"[DEC] LAYER IN ERROR: {layer?.Name ?? "Unknown"}");
            sb.AppendLine($"[DEC] {decorator}");

            var argExistsMess = string.Empty;
            if (decorator.Definition.Arguments?.Any() ?? false) {
                argExistsMess = " with specified arguments";
                sb.AppendLine($"[DEC] ARGUMENTS:");
                foreach (var arg in decorator.Arguments) {
                    var argValue = row.GetValue(arg.Value ?? $"{{{arg.Name}}}");
                    var argOpt = arg.Optional ? string.Empty : "(*)";
                    sb.AppendLine($"{new string(' ', 4)}{argOpt} {arg.Name}: {argValue}");
                }
            }
            if (fieldItems is not null) {
                sb.AppendLine($"[DEC] Fields that uses the decorator{argExistsMess}");
                foreach (var field in fieldItems) {
                    sb.AppendLine($"[DEC] {new string(' ', 4)}{field.Field}");
                }
            }
            sb.AppendLine($"[DEC] MESSAGE: {innerException.Message}");
            sb.AppendLine(new string('-', 80));
            sb.AppendLine($"[DEC] STACK: {innerException.Demystify()}");
            sb.AppendLine(new string('-', 80));
            return sb.ToString();
        }

    }
}
