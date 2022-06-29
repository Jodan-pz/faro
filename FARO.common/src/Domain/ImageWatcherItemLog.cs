using System;
using System.Runtime.Serialization;

namespace FARO.Common.Domain {
    [DataContract]
    public class ImageWatcherItemLog {
        [DataMember(Name = "image")] public string ImageName { get; set; }
        [DataMember(Name = "layer")] public string LayerName { get; set; }
        [DataMember(Name = "decorator")] public string DecoratorName { get; set; }
        [DataMember(Name = "field")] public string Field { get; set; }
        [DataMember(Name = "start")] public DateTime Start { get; set; }
        [DataMember(Name = "stop")] public DateTime Stop { get; set; }
        [DataMember(Name = "elapsed")] public double TotalMilliseconds { get; set; }
    }
}
