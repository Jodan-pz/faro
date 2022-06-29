using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FARO.Common;

namespace FARO.Services.Decorators.Engine {
    public class CachedDecoratorEngine : IDecoratorEngine {
        readonly IDecoratorEngine _decoratorEngine;
        readonly IDecoratorEngineCache _cache;

        public CachedDecoratorEngine(IDecoratorEngine decoratorEngine, IDecoratorEngineCache cache) {
            _decoratorEngine = decoratorEngine ?? throw new ArgumentNullException(nameof(decoratorEngine));
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
        }

        public async Task<IDictionary<string, object>> GetValuesAsync(IDecorator decorator, ImageOutputRow imageOutputRow, IDataResourceService dataResource) {
            var requestHash = MakeHash(decorator, imageOutputRow);
            var cachedValue = await _cache.GetAsync(requestHash);
            if (cachedValue != null) return cachedValue.Value.Result;
            var decoratorResult = await _decoratorEngine.GetValuesAsync(decorator, imageOutputRow, dataResource);
            await _cache.SetAsync(requestHash, new DecoratorCachedValue(decorator.Definition.Id, decoratorResult));
            return decoratorResult;
        }

        static string MakeHash(IDecorator decorator, ImageOutputRow imageOutputRow) => decorator.Arguments.Aggregate(
            $"DECORATOR_VALUE_{decorator.Definition.Id}",
            (a, c) => a += $"|{c.Name}|{imageOutputRow.GetValue(c.Value ?? $"{{{c.Name}}}")}"
            );
    }
}
