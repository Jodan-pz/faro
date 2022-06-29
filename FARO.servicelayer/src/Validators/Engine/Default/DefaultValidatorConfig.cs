using System.Collections.Generic;

namespace FARO.Services.Validators.Engine.Default {
    public class DefaultValidatorConfig {
        public bool FailFast { get; set; }
        public IEnumerable<DefaultValidatorConfigRule> Rules { get; set; }
    }
}
