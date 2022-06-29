using System.Collections.Generic;
using System.Runtime.Serialization;

namespace FARO.Common.Domain {
    [DataContract]
    public class WriterDefinition : IObjectDefinition {
        [DataMember(Name = "id")] public string Id { get; set; }
        [DataMember(Name = "name")] public string Name { get; set; }
        [DataMember(Name = "description")] public string Description { get; set; }
        [DataMember(Name = "tags")] public IEnumerable<string> Tags { get; set; }
        [DataMember(Name = "kind")] public string Kind { get; set; }
        [DataMember(Name = "args")] public IEnumerable<Argument> Arguments { get; set; }
        [DataMember(Name = "config")] public IDictionary<string, dynamic> Config { get; set; }
    }
}
