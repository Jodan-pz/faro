using System;
using System.Diagnostics;
using System.Runtime.Serialization;
using System.Text;

namespace FARO.Common.Exceptions {

    [Serializable]
    public class ValidatorException : Exception {
        public ValidatorException() {
        }

        public ValidatorException(string message) : base(message) { }
        public ValidatorException(string message, Exception innerException) : base(message, innerException) { }

        public ValidatorException(IValidator validator, Exception innerException)
        : this(BuildMessage(validator, innerException)) { }

        protected ValidatorException(SerializationInfo info, StreamingContext context) : base(info, context) {
        }

        private static string BuildMessage(IValidator validator, Exception innerException) {
            var sb = new StringBuilder();
            sb.AppendLine("-=== VALIDATOR ERROR DETAILS ===-");
            sb.AppendLine(validator.ToString());
            sb.AppendLine($"[VAL] MESSAGE: {innerException.Message}");
            sb.AppendLine(new string('-', 80));
            sb.AppendLine($"[VAL] STACK: {innerException.Demystify()}");
            sb.AppendLine(new string('-', 80));
            return sb.ToString();
        }
    }
}
