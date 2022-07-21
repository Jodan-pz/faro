using System;
using System.Collections.Generic;

using FARO.Common;
using FARO.Common.Domain;
using FARO.Services.Aggregators;
using FARO.Services.Decorators;
using FARO.Services.KeysIterators;
using FARO.Services.Validators;
using FARO.Services.Writers;
using static FARO.Common.Constants;

namespace FARO.Services {
    public class EngineFactory : IEngineFactory {
        readonly Func<string, IKeysIteratorEngine> _keysEngineFactory;
        readonly Func<string, IDecoratorEngine> _decoratorEngineFactory;
        readonly Func<string, IValidatorEngine> _validatorEngineFactory;
        readonly Func<string, IAggregatorEngine> _aggregatorEngineFactory;
        readonly Func<string, IWriterEngine> _writerEngineFactory;
        private readonly IExpressionEvaluator _expressionEvaluator;
        private readonly IAppSupport _appSupport;

        public EngineFactory(Func<string, IKeysIteratorEngine> keyFactory,
                             Func<string, IDecoratorEngine> decoratorFactory,
                             Func<string, IValidatorEngine> validatorEngineFactory,
                             Func<string, IAggregatorEngine> aggregatorEngineFactory,
                             Func<string, IWriterEngine> writerEngineFactory,
                             IExpressionEvaluator expressionEvaluator,
                             IAppSupport appSupport = null) {
            _keysEngineFactory = keyFactory ?? throw new ArgumentNullException(nameof(keyFactory));
            _decoratorEngineFactory = decoratorFactory ?? throw new ArgumentNullException(nameof(decoratorFactory));
            _validatorEngineFactory = validatorEngineFactory ?? throw new ArgumentNullException(nameof(validatorEngineFactory));
            _aggregatorEngineFactory = aggregatorEngineFactory ?? throw new ArgumentNullException(nameof(aggregatorEngineFactory));
            _writerEngineFactory = writerEngineFactory ?? throw new ArgumentNullException(nameof(writerEngineFactory));
            _expressionEvaluator = expressionEvaluator;
            _appSupport = appSupport;
        }
        // implement interface
        public IDecorator CreateDecorator(SystemDecoratorKind kind, object value) => kind switch
        {
            SystemDecoratorKind.Key => new KeyDecorator(_decoratorEngineFactory(DECORATOR_KEY), (string)value),
            SystemDecoratorKind.Constant => new ConstantDecorator(_decoratorEngineFactory(DECORATOR_CONSTANT), value),
            SystemDecoratorKind.Expression => new ExpressionDecorator(_decoratorEngineFactory(DECORATOR_EXPRESSION), (string)value),
            _ => throw new ArgumentOutOfRangeException(nameof(kind), $"Not expected system decorator kind value: {kind}")
        };

        public IDecorator CreateDecorator(DecoratorDefinition definition,
                                          IDictionary<string, object> arguments = null, string map = null) =>
                                          new Decorator(definition,
                                          engine: definition.Source?.Type is not null ? _decoratorEngineFactory(definition.Source.Type) : null,
                                          arguments,
                                          map,
                                          new DataResourceService(_appSupport?.DecoratorsDataRootPath));
        public IKeysIterator CreateKeysIterator(KeysIteratorScopedDefinition definition) =>
                                                new KeysIterator(definition,
                                                engine: definition.Definition.Source?.Type is not null ? _keysEngineFactory(definition.Definition.Source.Type) : null,
                                                _expressionEvaluator,
                                                new DataResourceService(_appSupport?.KeysIteratorsDataRootPath));

        public IValidator CreateValidator(ValidatorDefinition definition) =>
                                          new Validator(definition,
                                          _validatorEngineFactory(definition.Kind),
                                          new DataResourceService(_appSupport?.ValidatorsDataRootPath));

        public IAggregator CreateAggregator(AggregatorDefinition definition) =>
                                            new Aggregator(definition,
                                            _aggregatorEngineFactory(definition.Kind),
                                            new DataResourceService(_appSupport?.AggregatorsDataRootPath));

        public IWriter CreateWriter(WriterDefinition definition) =>
                                    new Writer(definition,
                                    _writerEngineFactory(definition.Kind),
                                    new DataResourceService(_appSupport?.WritersDataRootPath));
    }
}
