using System.Collections.Generic;
using FARO.Common.Domain;

namespace FARO.Common {
    public interface IImageItemResolver {
        KeysIteratorDefinition GetKeysIteratorDefinition(string id);
        DecoratorDefinition GetDecoratorDefinition(string id);
        IDecorator ResolveDecorator(object nameToResolve, IDictionary<string, object> args = null);
        IKeysIterator ResolveKeysIterator(ImageKeysIteratorsDefinition keysDef);
    };
}