using System.Collections.Generic;
using System.Runtime.Serialization;

namespace FARO.Common.Domain {
    [DataContract]
    public class ImageAggregators {
        [DataMember(Name = "aggregators")] public IEnumerable<AggregatorDefinition> Aggregators { get; set; }
        [DataMember(Name = "imagefields")] public IEnumerable<string> ImageFields { get; set; }

    }
}