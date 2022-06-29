using System;

namespace FARO.Common.Exceptions {
    public class ValidateResultException : Exception {
        public IValidator Validator { get; set; }
        public ValidatorResult Result { get; set; }

        public ValidateResultException(IValidator validator, ValidatorResult result)
        : base($"Validation error using: {validator.Definition.Name}") {
            Validator = validator;
            Result = result;
        }
    }
}
