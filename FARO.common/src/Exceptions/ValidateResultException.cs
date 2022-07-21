using System;
using System.Runtime.Serialization;

namespace FARO.Common.Exceptions {

    [Serializable]
    public class ValidateResultException : Exception {
        public IValidator Validator { get; set; }
        public ValidatorResult Result { get; set; }

        public ValidateResultException(IValidator validator, ValidatorResult result)
        : base($"Validation error using: {validator.Definition.Name}") {
            Validator = validator;
            Result = result;
        }

        public ValidateResultException() {
        }

        protected ValidateResultException(SerializationInfo info, StreamingContext context) : base(info, context) {
        }

        public ValidateResultException(string message) : base(message) {
        }

        public ValidateResultException(string message, Exception innerException) : base(message, innerException) {
        }
    }
}
