using System.Collections.Generic;
using Newtonsoft.Json.Linq;

namespace FARO.Services.Helpers {
    public static class DynamicConfigValueHelper {
        public static T GetConfig<T>(IDictionary<string, dynamic> config) where T : class, new() {
            if (!config.ContainsKey("value")) return new T();
            var cfg = config["value"];
            if (cfg is T t) return t;
            return (cfg as JObject)?.ToObject<T>() ?? new T();
        }
    }
}
