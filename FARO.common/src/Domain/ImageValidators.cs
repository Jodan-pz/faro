using System.Collections.Generic;
using System.Runtime.Serialization;

namespace FARO.Common.Domain {
    [DataContract]
    public class ImageValidators {
        [DataMember(Name = "validators")] public IEnumerable<ValidatorDefinition> Validators { get; set; }
        [DataMember(Name = "imagefields")] public IEnumerable<string> ImageFields { get; set; }

    }
}