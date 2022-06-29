using System.Collections.Generic;
using System.Runtime.Serialization;

namespace FARO.Common.Domain {
    [DataContract]
    public class ImageBuildResult {
        [DataMember(Name = "rows")] public IEnumerable<IDictionary<string, object>> Rows { get; set; }
        [DataMember(Name = "watcheritemlogs")] public IEnumerable<ImageWatcherItemLog> ImageWatcherItemLogs { get; set; }
    }
}
