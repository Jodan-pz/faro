using FARO.Common.Domain;

namespace FARO.Common {
    public class FlowItem {
        public FlowItem(FlowItemDefinition definition) {
            Definition = definition;
        }

        public FlowItemDefinition Definition { get; }
        public IImage Image { get; set; }
        public IValidator Validator { get; set; }
        public IWriter Writer { get; set; }
        public IAggregator Aggregator { get; set; }

        public readonly record struct FlowRunOptions(bool Check, ImagePersisterOptions ImagePersister);

        public FlowRunOptions RunOptions { get; set; }
    }
}
