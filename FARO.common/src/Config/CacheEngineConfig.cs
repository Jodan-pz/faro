using System;
using Microsoft.Extensions.Configuration;

namespace FARO.Common {
    public class CacheEngineConfig {
        const string SECTION = "FARO:cacheEngine";
        const string CURRENT_ENGINE = "current";
        const string ENABLED = "enabled";
        const string ABSOLUTE_EXPIRATION = "absoluteExpiration";
        const string SLIDING_EXPIRATION = "slidingExpiration";

        public static CacheEngineConfig FromConfiguration(IConfiguration config) {
            var cacheSection = config.GetSection(SECTION);
            var cacheCurrentEngine = cacheSection.GetValue<string>(CURRENT_ENGINE);
            var cacheEnabled = cacheSection.GetValue(ENABLED, false);
            var absoluteExpiration = cacheSection.GetValue(ABSOLUTE_EXPIRATION, -1);
            var slidingExpiration = cacheSection.GetValue(SLIDING_EXPIRATION, -1);
            CacheEngineConfig cacheConfig = null;
            if (cacheCurrentEngine != null && cacheEnabled) {
                try {
                    cacheConfig = Activator.CreateInstance(Type.GetType($"{typeof(CacheEngineConfig).Namespace}.{cacheCurrentEngine}CacheEngineConfig", true, true)) as CacheEngineConfig;
                    cacheSection.GetSection(cacheCurrentEngine).Bind(cacheConfig);
                    if (absoluteExpiration != -1) cacheConfig.AbsoluteExpiration = TimeSpan.FromSeconds(absoluteExpiration);
                    if (slidingExpiration != -1) cacheConfig.SlidingExpiration = TimeSpan.FromSeconds(slidingExpiration);
                } catch { /* wrong configuration */
                    return null;
                }
            }
            return cacheConfig;
        }

        public TimeSpan? AbsoluteExpiration { get; set; }
        public TimeSpan? SlidingExpiration { get; set; }

        public bool Is<T>(out T result) where T : CacheEngineConfig {
            result = default;
            if (this is T t) {
                result = t;
                return true;
            }
            return false;
        }
    }

    public class MemoryCacheEngineConfig : CacheEngineConfig {
        /// <summary>
        /// Gets or sets the maximum size of the cache.
        /// </summary>
        /// <value>Size limit value</value>
        public long? SizeLimit { get; set; }
        /// <summary>
        /// Expiration scan expressed in seconds
        /// </summary>
        /// <value>Seconds value</value>
        public double? ExpirationScan { get; set; }
    }

    public class RedisCacheEngineConfig : CacheEngineConfig { }
}
