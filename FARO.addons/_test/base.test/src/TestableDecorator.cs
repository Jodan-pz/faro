using FARO.Common;
using FARO.Common.Domain;

namespace FARO.Addons.Test {

    internal class TestableDecorator<TEngine> : IDecorator where TEngine : IDecoratorEngine {
        private readonly DecoratorDefinition _def;
        private readonly IDecoratorEngine _engine;
        private readonly IEnumerable<ArgumentValue>? _args;

        public TestableDecorator(DecoratorDefinition definition, IDecoratorEngine engine, IEnumerable<ArgumentValue> args) {
            _def = definition;
            _engine = engine;
            _args = args;
        }

        public IEnumerable<ArgumentValue>? Arguments => _args;

        public DecoratorDefinition Definition => _def;

        public string HashKey => throw new System.NotImplementedException();

        public string? Map { get; set; }

        public Task<IDictionary<string, object>> GetValuesAsync(ImageOutputRow imageOutputRow) {
            if (_engine is null) return Task.FromResult<IDictionary<string, object>>(new Dictionary<string, object>());
            return _engine.GetValuesAsync(this, imageOutputRow, null);
        }
    }
}