using System.Collections.Generic;
using System.Runtime.Serialization;

namespace FARO.Common.Domain {
    [DataContract]
    public class ImageBuildDefinition {
        [DataMember(Name = "image")] public ImageDefinition Image { get; set; }
        [DataMember(Name = "availableaggregators")] public IEnumerable<AggregatorDefinition> AvailableAggregators { get; set; }
        [DataMember(Name = "availablevalidators")] public IEnumerable<ValidatorDefinition> AvailableValidators { get; set; }
        [DataMember(Name = "aggregator")] public AggregatorDefinition Aggregator { get; set; }
        [DataMember(Name = "validator")] public ValidatorDefinition Validator { get; set; }
        [DataMember(Name = "args")] public IEnumerable<ArgumentValue> Arguments { get; set; }
        [DataMember(Name = "keyslimit")] public int? KeysLimit { get; set; } = 10;
        [DataMember(Name = "enablewatch")] public bool? EnableWatch { get; set; }
        [DataMember(Name = "persister")] public ImageBuildPersisterDefinition Persister { get; set; }

    }
}
