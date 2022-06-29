using System.Collections.Generic;
using System.Runtime.Serialization;

namespace FARO.Common.Domain {
    [DataContract]
    public class ImageDefinition : IObjectDefinition {
        [DataMember(Name = "id")] public string Id { get; set; }
        [DataMember(Name = "name")] public string Name { get; set; }
        [DataMember(Name = "description")] public string Description { get; set; }
        [DataMember(Name = "filter")] public string Filter { get; set; }
        [DataMember(Name = "tags")] public IEnumerable<string> Tags { get; set; }
        [DataMember(Name = "keys")] public ImageKeysIteratorsDefinition[] KeysIterators { get; set; }
        [DataMember(Name = "layers")] public IEnumerable<LayerDefinition> Layers { get; set; }
    }
}
