using System.Collections.Generic;
using System.Runtime.Serialization;

namespace FARO.Common.Domain {
    [DataContract]
    public class ImageBuildPersisterDefinition {
        [DataMember(Name = "enabled")] public bool Enabled { get; set; }
        [DataMember(Name = "buildstep")] public string BuildStep { get; set; }
    }
}
