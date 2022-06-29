using FARO.Common;
using FARO.Common.Domain;

namespace FARO.Services.Decorators {
    public class ExpressionDecorator : ConstantDecorator {
        const string ID = "EXPR";
        static readonly DecoratorDefinition definition = new() { Id = ID };

        public ExpressionDecorator(IDecoratorEngine engine, string expression) : base(definition, engine, expression) { }
    }
}