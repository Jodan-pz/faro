using System.Runtime.Serialization;

namespace FARO.Common.Domain {
    [DataContract]
    public class LayerFieldItemDefinition {
        [DataMember(Name = "field")] public string Field { get; set; }
        [DataMember(Name = "config")] public dynamic Config { get; set; }
    }
}
