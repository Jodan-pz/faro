using System.Collections.Generic;

using FARO.Common.Domain;

namespace FARO.Common {
    public interface IEngineFactory {
        IKeysIterator CreateKeysIterator(KeysIteratorScopedDefinition definition);
        IDecorator CreateDecorator(SystemDecoratorKind kind, object value);
        IDecorator CreateDecorator(DecoratorDefinition definition,
                                   IDictionary<string, object> arguments = null, string map = null);
        IValidator CreateValidator(ValidatorDefinition definition);
        IAggregator CreateAggregator(AggregatorDefinition definition);
        IWriter CreateWriter(WriterDefinition definition);
    }
}