using System.Collections.Generic;

using FARO.Common.Domain;

namespace FARO.Common {
    public interface IImageFactory {
        IImage CreateImage(ImageDefinition definition,
                           IEngineFactory engineFactory,
                           IDictionary<string, KeysIteratorDefinition> keysIterators,
                           IDictionary<string, DecoratorDefinition> decorators);

    }
}