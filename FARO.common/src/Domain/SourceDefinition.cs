using System.Collections.Generic;
using System.Runtime.Serialization;

namespace FARO.Common.Domain {
    [DataContract]
    public class SourceDefinition {
        [DataMember(Name = "args")] public IDictionary<string, string> Arguments { get; set; }
    }

    [DataContract]
    public class DecoratorSourceDefinition : SourceDefinition {
        [DataMember(Name = "type")] public string Type { get; set; }
    }

    [DataContract]
    public class KeysIteratorSourceDefinition : SourceDefinition {
        [DataMember(Name = "type")] public string Type { get; set; }
    }

}
