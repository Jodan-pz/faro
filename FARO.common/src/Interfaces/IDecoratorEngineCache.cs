using System.Threading.Tasks;

namespace FARO.Common {
    public interface IDecoratorEngineCache {
        Task<DecoratorCachedValue?> GetAsync(string key);
        Task SetAsync(string key, DecoratorCachedValue cacheValue);
    }
}
