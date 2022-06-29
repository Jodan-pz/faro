using System;
using System.Collections.Generic;
using System.Text;

using FARO.Common;
using FARO.Common.Domain;
using FARO.Common.Exceptions;

namespace FARO.Services.Aggregators {
    public class Aggregator : IAggregator {
        private readonly IAggregatorEngine _engine;
        private readonly IDataResourceService _dataResourceService;
        private readonly AggregatorDefinition _definition;
        public Aggregator(AggregatorDefinition definition,
                          IAggregatorEngine engine,
                          IDataResourceService dataResourceService) {
            _definition = definition;
            _engine = engine;
            _dataResourceService = dataResourceService;
        }

        public AggregatorDefinition Definition => _definition;

        public IEnumerable<FieldDescription> GetFields() => _engine?.GetFields(Definition);
        public IEnumerable<string> GetAggregatedFields() => _engine?.GetAggregatedFields(Definition);

        public IImageOutput Aggregate(IImageOutput output) {
            try {
                var ret = _engine?.Aggregate(this, output, _dataResourceService);
                ret.OnIterate = output.OnIterate;
                output.OnChange?.Invoke(new ChangeOutputEventArgs(this, ImageOutputChangeType.Aggregation, output: ret));
                return ret;
            } catch (Exception ex) {
                throw new AggregatorException(this, output, ex);
            }
        }

        public override string ToString() {
            var sb = new StringBuilder();
            sb.AppendLine($"AGGREGATOR: {Definition.Id} {Definition.Name} {Definition.Description}");
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
