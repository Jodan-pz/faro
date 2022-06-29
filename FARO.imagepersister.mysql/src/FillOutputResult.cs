
using FARO.Common;

namespace FARO.Services.ImagePersister {
    internal struct FillOutputResult {
        public FillOutputResult(ImageOutput output, bool keysLoaded, string layerNameLoaded, bool rowLoaded, bool aggregationLoaded) {
            Output = output;
            KeysLoaded = keysLoaded;
            LayerNameLoaded = layerNameLoaded;
            RowLoaded = rowLoaded;
            AggregationLoaded = aggregationLoaded;
        }

        public ImageOutput Output { get; set; } = null;
        public bool KeysLoaded { get; set; }
        public string LayerNameLoaded { get; set; }
        public bool RowLoaded { get; set; }
        public bool AggregationLoaded { get; set; }

        public bool IsEmpty => Output is null;
        public bool IsLoaded => !IsEmpty && (AggregationLoaded || RowLoaded || LayerNameLoaded is not null || KeysLoaded);
    }
}
