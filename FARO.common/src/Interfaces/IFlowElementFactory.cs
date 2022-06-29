using System.Collections.Generic;

using FARO.Common;
using FARO.Common.Domain;

namespace FARO.Services {
    public interface IFlowElementFactory {
        IEngineFactory Engined { get; }
        IImage CreateImage(ImageDefinition definition,
                           IDictionary<string, KeysIteratorDefinition> keysIterators,
                           IDictionary<string, DecoratorDefinition> decorators);
    }
}