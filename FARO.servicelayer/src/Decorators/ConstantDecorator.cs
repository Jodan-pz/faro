using System.Collections.Generic;
using System.Linq;

using FARO.Common;
using FARO.Common.Domain;

namespace FARO.Services.Decorators {
    public class ConstantDecorator : Decorator {
        const string ID = "CONST";
        static readonly DecoratorDefinition constDefinition = new() { Id = ID, Name = "Constant" };
        public ConstantDecorator(IDecoratorEngine engine, object constant)
        : this(constDefinition, engine, constant) { }

        public override string ToString() => $"{Definition.Name} value: {Arguments.Single().Value}";

        protected ConstantDecorator(DecoratorDefinition definition, IDecoratorEngine engine, object value)
        : base(definition, engine, new Dictionary<string, object> { [definition.Id] = value }) { }

        protected override IEnumerable<ArgumentValue> CreateArguments(IDictionary<string, object> args) {
            yield return new() { Name = Definition.Id, Value = args[Definition.Id] };
        }

    }
}