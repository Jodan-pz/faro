using FARO.Common;

using FARO.Common.Domain;

namespace FARO.Addons.Test {

    public class BaseTest {

        public IDecorator MakeDecorator<TDecoratorEngine>(DecoratorDefinition definition, IEnumerable<ArgumentValue> args)
                          where TDecoratorEngine : IDecoratorEngine, new() {

            return new TestableDecorator<TDecoratorEngine>(definition, Activator.CreateInstance<TDecoratorEngine>(), args);
        }

        public IDecorator MakeDecorator(Func<IExpressionEvaluator, IConnectionRetriever?, IDecoratorEngine> engineCreator, DecoratorDefinition definition, IEnumerable<ArgumentValue> args) {
            var engine = engineCreator(VoidExpressionEvaluator.Instance, null);
            var tret = typeof(TestableDecorator<>).MakeGenericType(engine.GetType()) ?? throw new ArgumentException("Cannot create engine: " + engine.GetType().Name);
            var dec = (IDecorator)Activator.CreateInstance(tret, definition, engine, args)!;
            return dec;
        }

        public IKeysIterator MakeKeysIterator<TKeysIteratorEngine>(KeysIteratorDefinition definition)
                          where TKeysIteratorEngine : IKeysIteratorEngine, new() {

            return new TestableKeysIterator<TKeysIteratorEngine>(definition, Activator.CreateInstance<TKeysIteratorEngine>());
        }

        public IKeysIterator MakeKeysIterator(Func<IKeysIteratorEngine> engineCreator, KeysIteratorDefinition defintion) {
            var engine = engineCreator();
            var tret = typeof(TestableKeysIterator<>).MakeGenericType(engine.GetType()) ?? throw new ArgumentException("Cannot create engine: " + engine.GetType().Name);
            var keysIter = (IKeysIterator)Activator.CreateInstance(tret, defintion, engine)!;
            return keysIter;
        }

    }
}