using System.Threading.Tasks;
using FARO.Common;
using Microsoft.Extensions.Caching.Distributed;
using Newtonsoft.Json;

namespace FARO.Services.Decorators.Engine.Cache {
    public class DecoratorEngineCache : IDecoratorEngineCache {
        readonly IDistributedCache _distributedCache;
        readonly CacheEngineConfig _config;

        public DecoratorEngineCache(IDistributedCache distributedCache, CacheEngineConfig config) {
            _distributedCache = distributedCache;
            _config = config;
        }

        public async Task<DecoratorCachedValue?> GetAsync(string key) {
            if (_distributedCache == null) return null;
            DecoratorCachedValue? value = null;
            var cachedValue = await _distributedCache.GetStringAsync(key);
            if (cachedValue != null) value = DeserializeResult(cachedValue);
            return value;
        }

        public Task SetAsync(string key, DecoratorCachedValue cacheValue) {
            if (_distributedCache == null) return Task.CompletedTask;
            var valueToCache = SerializeResult(cacheValue);
            var opts = new DistributedCacheEntryOptions();
            if (_config?.AbsoluteExpiration != null)
                opts.SetAbsoluteExpiration(_config.AbsoluteExpiration.Value);
            if (_config?.SlidingExpiration != null)
                opts.SetSlidingExpiration(_config.SlidingExpiration.Value);
            return _distributedCache.SetStringAsync(key, valueToCache, opts);
        }

        static string SerializeResult(DecoratorCachedValue result) {
            string ret = null;
            try {
                ret = JsonConvert.SerializeObject(result);
            } catch { /* skip serializ. errors */}
            return ret;
        }

        static DecoratorCachedValue? DeserializeResult(string result) {
            try {
                return JsonConvert.DeserializeObject<DecoratorCachedValue>(result);
            } catch { /* skip serializ. errors */}
            return null;
        }
    }
}
