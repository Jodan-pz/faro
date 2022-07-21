using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;

namespace FARO.Common.Exceptions {

    [Serializable]
    public class WriterException : Exception {
        public WriterException() {
        }

        public WriterException(string message) : base(message) { }
        public WriterException(string message, Exception innerException) : base(message, innerException) { }

        public WriterException(IWriter writer, IDictionary<string, object> args, Exception innerException)
        : this(BuildMessage(writer, args, innerException)) { }

        protected WriterException(SerializationInfo info, StreamingContext context) : base(info, context) {
        }

        private static string BuildMessage(IWriter writer, IDictionary<string, object> args, Exception innerException) {
            var sb = new StringBuilder();
            sb.AppendLine("-=== WRITER ERROR DETAILS ===-");
            sb.AppendLine(writer.ToString());
            if (writer.Definition.Arguments?.Any() ?? false) {
                sb.AppendLine($"[WRI] ARGUMENTS:");
                foreach (var arg in writer.Definition.Arguments) {
                    var argName = arg.Name;
                    var argValue = args.ContainsKey(argName) ? args[argName] : string.Empty;
                    var argOpt = arg.Optional ? string.Empty : "(*)";
                    sb.AppendLine($"{new string(' ', 4)}{argOpt} {arg.Name}: {argValue}");
                }
            }
            sb.AppendLine($"[WRI] MESSAGE: {innerException.Message}");
            sb.AppendLine(new string('-', 80));
            sb.AppendLine($"[WRI] STACK: {innerException.Demystify()}");
            sb.AppendLine(new string('-', 80));
            return sb.ToString();
        }
    }
}
