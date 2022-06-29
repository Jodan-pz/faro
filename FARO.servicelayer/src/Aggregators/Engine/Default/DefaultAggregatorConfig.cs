using System.Collections.Generic;

namespace FARO.Services.Aggregators.Engine.Default {
    public class DefaultAggregatorConfig {
        public IEnumerable<DefaultAggregatorConfigField> Fields { get; set; }
        public string Filter { get; set; }
    }
}
