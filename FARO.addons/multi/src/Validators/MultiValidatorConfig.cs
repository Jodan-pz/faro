using System.Collections.Generic;

namespace FARO.Addons.Multi.Validators {

    class ValidatorConfig {
        public string? Id { get; set; }
        public bool FailFast { get; set; }
    }

    class MultiValidatorConfig {
        public ValidatorConfig[]? Validators { get; set; }
        public bool FailFast { get; set; }
    }
}