using System.Collections.Generic;

namespace FARO.Common.Domain {
    public class FlowItemImagePersisterState {
        public bool IsNew { get; set; }
        public IEnumerable<string> Layers { get; set; }
        public bool KeysExists { get; set; }
        public bool RowsExists { get; set; }
        public bool AggregationExists { get; set; }
        public bool LayerStepRequested { get; set; }
        public string LayerStepName { get; set; }
        public bool RowStepRequested { get; set; }
        public bool AggregationStepRequested { get; set; }
    }
}
