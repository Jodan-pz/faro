using System.Collections.Generic;
using System.Runtime.Serialization;

namespace FARO.Common.Domain {
    [DataContract]
    public class KeysIteratorDefinition : IObjectDefinition {
        [DataMember(Name = "id")] public string Id { get; set; }
        [DataMember(Name = "name")] public string Name { get; set; }
        [DataMember(Name = "description")] public string Description { get; set; }
        [DataMember(Name = "tags")] public IEnumerable<string> Tags { get; set; }
        [DataMember(Name = "args")] public IEnumerable<Argument> Arguments { get; set; }
        [DataMember(Name = "fields")] public IEnumerable<OutputField> Fields { get; set; }
        [DataMember(Name = "when")] public string When { get; set; }
        [DataMember(Name = "filter")] public string Filter { get; set; }
        [DataMember(Name = "source")] public KeysIteratorSourceDefinition Source { get; set; }
    }
}