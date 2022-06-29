using System.Collections.Generic;
using System.Runtime.Serialization;

namespace FARO.Common.Domain {
    [DataContract]
    public class FlowItemRunDefinition {
        [DataMember(Name = "flow")] public FlowItemDefinition FlowItem { get; set; }
        [DataMember(Name = "imageargs")] public IEnumerable<ArgumentValue> ImageArguments { get; set; }
        [DataMember(Name = "writerargs")] public IEnumerable<ArgumentValue> WriterArguments { get; set; }
        [DataMember(Name = "keyslimit")] public int? KeysLimit { get; set; } = 10;
        [DataMember(Name = "persister")] public ImageBuildPersisterDefinition Persister { get; set; }
    }
}
