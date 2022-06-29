using System.Collections.Generic;
using System.Runtime.Serialization;

namespace FARO.Common.Domain {
    [DataContract]
    public class KeysIteratorRunDefinition {
        [DataMember(Name = "args")] public IEnumerable<ArgumentValue> Arguments { get; set; }
        [DataMember(Name = "keyslimit")] public int? KeysLimit { get; set; } = 10;
    }
}
