using System;
using System.Collections.Generic;
using System.Text;

using FARO.Common;
using FARO.Common.Domain;
using FARO.Common.Exceptions;

namespace FARO.Services.Validators {
    public class Validator : IValidator {
        private readonly IValidatorEngine _engine;
        private readonly IDataResourceService _dataResourceService;
        private readonly ValidatorDefinition _definition;

        public Validator(ValidatorDefinition definition,
                         IValidatorEngine validatorEngine,
                         IDataResourceService dataResourceService) {
            _definition = definition;
            _engine = validatorEngine;
            _dataResourceService = dataResourceService;
        }

        public ValidatorDefinition Definition => _definition;
        public IEnumerable<FieldDescription> GetFields() => _engine?.GetFields(Definition);

        public ValidatorResult Validate(IImageOutput output) {
            try {
                return _engine?.Validate(this, output, _dataResourceService);
            } catch (Exception ex) {
                throw new ValidatorException(this, ex);
            }
        }

        public override string ToString() {
            var sb = new StringBuilder();
            sb.AppendLine($"VALIDATOR: {Definition.Id} {Definition.Name} {Definition.Description}");
            sb.AppendLine($"Data path: {_dataResourceService}");
            sb.AppendLine($"Kind: {Definition.Kind}");
            if (Definition.Config != null) {
                sb.AppendLine("--- Configuration ---");
                foreach (var arg in Definition.Config) sb.AppendLine(arg.ToString());
            }
            return sb.ToString();
        }

    }
}
