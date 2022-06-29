using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;

namespace FARO.Common.Exceptions {
    public class KeysIteratorException : Exception {
        public KeysIteratorException(string message) : base(message) { }
        public KeysIteratorException(string message, Exception innerException) : base(message, innerException) { }

        public KeysIteratorException(IKeysIterator keysIterator, IDictionary<string, object> args, Exception innerException, int? level)
        : this(BuildMessage(keysIterator, args, innerException, level)) { }

        private static string BuildMessage(IKeysIterator keysIterator, IDictionary<string, object> args, Exception innerException, int? level) {
            var isSourceError = innerException is not KeysIteratorException;
            var sb = new StringBuilder();
            if (!isSourceError) {
                sb.AppendLine($"{innerException.Message}");
            } else {
                sb.AppendLine("-=== KEYS ITERATION ERROR DETAILS ===-");
            }
            var keySource = sb.Length == 0 ? level == null ? "[KEYS]" : $"[KEYS #{level}]" : $"[KEYS #{level?.ToString() ?? "MAIN"}]";
            sb.AppendLine($"{keySource} {keysIterator.Definition.Name ?? "Unknown"}");
            if (keysIterator.Definition.Arguments?.Any() ?? false) {
                sb.AppendLine($"{keySource} ARGUMENTS:");
                foreach (var arg in keysIterator.Definition.Arguments) {
                    var argName = keysIterator.GetArgumentName(arg.Name);
                    var argValue = args.ContainsKey(argName) ? args[argName] : string.Empty;
                    var argOpt = arg.Optional ? string.Empty : "(*)";
                    sb.AppendLine($"{new string(' ', 4)}{argOpt} {arg.Name}: {argValue}");
                }
            }
            if (isSourceError) {
                sb.AppendLine($"{keySource} MESSAGE: {innerException.Message}");
                sb.AppendLine(new string('-', 80));
                sb.AppendLine($"{keySource} STACK: {innerException.Demystify()}");
                sb.AppendLine(new string('-', 80));
            }
            return sb.ToString();
        }
    }
}
