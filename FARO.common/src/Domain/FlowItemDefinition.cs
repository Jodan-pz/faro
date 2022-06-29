using System.Collections.Generic;
using System.Runtime.Serialization;

namespace FARO.Common.Domain {
    [DataContract]
    public class FlowItemDefinition : IObjectDefinition {
        [DataMember(Name = "id")] public string Id { get; set; }
        [DataMember(Name = "name")] public string Name { get; set; }
        [DataMember(Name = "description")] public string Description { get; set; }
        [DataMember(Name = "tags")] public IEnumerable<string> Tags { get; set; }
        [DataMember(Name = "image")] public string ImageId { get; set; }
        [DataMember(Name = "aggregator")] public string AggregatorId { get; set; }
        [DataMember(Name = "validator")] public string ValidatorId { get; set; }
        [DataMember(Name = "writer")] public string WriterId { get; set; }
    }
}
