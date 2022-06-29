using System.Runtime.Serialization;

namespace FARO.Common.Domain {
    [DataContract]
    public class Argument {
        [DataMember(Name = "name")] public string Name { get; set; }
        [DataMember(Name = "description")] public string Description { get; set; }
        [DataMember(Name = "optional")] public bool Optional { get; set; }

        public override string ToString() => $"{Name} {Description} {(!Optional ? "(*)" : "")}";
    }
}