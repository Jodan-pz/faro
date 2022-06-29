
using System.Collections.Generic;
using System.Linq;

using FARO.Common;
using FARO.Common.Domain;
using static FARO.Common.Helpers.PrefixHelper;

namespace FARO.Services {
    public class ImageItemResolver : IImageItemResolver {
        private readonly IDictionary<string, KeysIteratorDefinition> _keysIteratorsDefinitions;
        private readonly IDictionary<string, DecoratorDefinition> _decoratorDefinitions;
        private readonly IEngineFactory _engineFactory;

        public ImageItemResolver(IEngineFactory engineFactory,
                                 IDictionary<string, KeysIteratorDefinition> keys,
                                 IDictionary<string, DecoratorDefinition> decorators) {
            _engineFactory = engineFactory ?? throw new System.ArgumentNullException(nameof(engineFactory));
            _keysIteratorsDefinitions = keys;
            _decoratorDefinitions = decorators;
        }

        public KeysIteratorDefinition GetKeysIteratorDefinition(string id) {
            return _keysIteratorsDefinitions.ContainsKey(id) ? _keysIteratorsDefinitions[id] : null;
        }

        public DecoratorDefinition GetDecoratorDefinition(string id) {
            return _decoratorDefinitions.ContainsKey(id) ? _decoratorDefinitions[id] : null;
        }

        public IKeysIterator ResolveKeysIterator(ImageKeysIteratorsDefinition imageKeysDef) {
            if (_keysIteratorsDefinitions?.ContainsKey(imageKeysDef.KeyId) ?? false) {
                var def = _keysIteratorsDefinitions[imageKeysDef.KeyId];
                return _engineFactory.CreateKeysIterator(KeysIteratorScopedDefinition.Create(def, imageKeysDef));
            }
            return null;
        }

        public IDecorator ResolveDecorator(object nameToResolve, IDictionary<string, object> args) {
            if (nameToResolve is string name) {
                if (IsKeyName(name, out var key)) {
                    return _engineFactory.CreateDecorator(SystemDecoratorKind.Key, key);
                }

                if (IsExpressionValue(name, out var expressionValue)) {
                    return _engineFactory.CreateDecorator(SystemDecoratorKind.Expression, expressionValue);
                }

                if (IsDecoratorName(name, out var decoratorName)) {
                    var decTokens = decoratorName.Split('.');
                    var realName = decTokens.First();
                    if (_decoratorDefinitions?.ContainsKey(realName) ?? false) {
                        var definition = _decoratorDefinitions[realName];
                        return _engineFactory.CreateDecorator(definition,
                                                              args,
                                                              decTokens.Length > 1 ? string.Join(".", decTokens.Skip(1)) : null);

                    }
                }
            }
            return _engineFactory.CreateDecorator(SystemDecoratorKind.Constant, nameToResolve);
        }
    }
}
