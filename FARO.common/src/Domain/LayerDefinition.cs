using System.Collections.Generic;
using System.Runtime.Serialization;

namespace FARO.Common.Domain {
    [DataContract]
    public class LayerDefinition {
        [DataMember(Name = "name")] public string Name { get; set; }

        [DataMember(Name = "items")] public IEnumerable<LayerFieldItemDefinition> Items { get; set; }
    }
}