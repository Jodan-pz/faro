using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;

namespace FARO.Common.Exceptions {

    [Serializable]
    public class KeysIteratorException : Exception {
        public KeysIteratorException() {
        }

        public KeysIteratorException(string message) : base(message) { }
        public KeysIteratorException(string message, Exception innerException) : base(message, innerException) { }

        public KeysIteratorException(IKeysIterator keysIterator, IDictionary<string, object> args, Exception innerException, int? level)
        : this(BuildMessage(keysIterator, args, innerException, level)) { }

        protected KeysIteratorException(SerializationInfo info, StreamingContext context) : base(info, context) {
        }

        private static string BuildMessage(IKeysIterator keysIterator, IDictionary<string, object> args, Exception innerException, int? level) {
            var isSourceError = innerException is not KeysIteratorException;
            var sb = new StringBuilder();
            if (!isSourceError) {
                sb.AppendLine($"{innerException.Message}");
            } else {
                sb.AppendLine("-=== KEYS ITERATION ERROR DETAILS ===-");
            }

            var keysCaption = level == null ? "[KEYS]" : $"[KEYS #{level}]";
            var keysSource = sb.Length == 0 ? keysCaption : $"[KEYS #{level?.ToString() ?? "MAIN"}]";
            sb.AppendLine($"{keysSource} {keysIterator.Definition.Name ?? "Unknown"}");
            if (keysIterator.Definition.Arguments?.Any() ?? false) {
                sb.AppendLine($"{keysSource} ARGUMENTS:");
                foreach (var arg in keysIterator.Definition.Arguments) {
                    var argName = keysIterator.GetArgumentName(arg.Name);
                    var argValue = args.ContainsKey(argName) ? args[argName] : string.Empty;
                    var argOpt = arg.Optional ? string.Empty : "(*)";
                    sb.AppendLine($"{new string(' ', 4)}{argOpt} {arg.Name}: {argValue}");
                }
            }
            if (isSourceError) {
                sb.AppendLine($"{keysSource} MESSAGE: {innerException.Message}");
                sb.AppendLine(new string('-', 80));
                sb.AppendLine($"{keysSource} STACK: {innerException.Demystify()}");
                sb.AppendLine(new string('-', 80));
            }
            return sb.ToString();
        }
    }
}
