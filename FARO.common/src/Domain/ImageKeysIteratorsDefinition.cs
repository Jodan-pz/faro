using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;

namespace FARO.Common.Domain {
    [DataContract]
    public class ImageKeysIteratorsDefinition {
        public static ImageKeysIteratorsDefinition[] Array(params string[] names) => names?.Select(n => new ImageKeysIteratorsDefinition(n)).ToArray();

        public ImageKeysIteratorsDefinition() { }
        public ImageKeysIteratorsDefinition(string keyId) { KeyId = keyId; }

        [DataMember(Name = "keyid")] public string KeyId { get; set; }
        [DataMember(Name = "args")] public Dictionary<string, string> Arguments { get; set; }
        [DataMember(Name = "fields")] public Dictionary<string, string> Fields { get; set; }

        public override string ToString() => KeyId;
    }
}