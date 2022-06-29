using FARO.Common;
using FARO.Common.Domain;

namespace FARO.Services.Decorators {
    public class KeyDecorator : ConstantDecorator {
        const string ID = "KEY";
        static readonly DecoratorDefinition definition = new() { Id = ID };

        public KeyDecorator(IDecoratorEngine engine, string keyName) : base(definition, engine, keyName) { }
    }
}