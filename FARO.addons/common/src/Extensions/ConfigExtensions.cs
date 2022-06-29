using Newtonsoft.Json.Linq;
namespace FARO.Addons.Common.Extensions {
    public static class ConfigExtensions {
        public static T? As<T>(this IDictionary<string, dynamic> config) where T : class, new() {
            if (!config.ContainsKey("value")) return null;
            var cfg = config["value"];
            if (cfg is T t) return t;
            return (cfg as JObject)?.ToObject<T>() ?? new T();
        }
    }
}