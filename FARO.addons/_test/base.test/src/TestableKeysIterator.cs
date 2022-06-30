using FARO.Common;

using FARO.Common.Domain;

namespace FARO.Addons.Test {
    internal class TestableKeysIterator<TEngine> : IKeysIterator where TEngine : IKeysIteratorEngine {

        private readonly KeysIteratorDefinition _def;
        private readonly IKeysIteratorEngine _engine;

        public TestableKeysIterator(KeysIteratorDefinition defintion, IKeysIteratorEngine engine) {
            _def = defintion;
            _engine = engine;
        }

        public KeysIteratorDefinition Definition => _def;

        public string GetArgumentName(string name) => name;

        public string GetOutputFieldName(string name) => name;

        public void Iterate(IDictionary<string, object> args, Action<IDictionary<string, object>> keyPredicate, int? level = null) {
            Iterate(args, (key) => { keyPredicate(key); return true; }, level);
        }

        public void Iterate(IDictionary<string, object> args, Func<IDictionary<string, object>, bool> keyPredicate, int? level = null) {
            if (_engine is null) return;
            foreach (var key in _engine.GetKeys(this, args, null)) keyPredicate(key);
        }
    }
}