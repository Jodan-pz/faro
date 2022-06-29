using System;
using System.Collections.Generic;

using FARO.Common;
using FARO.Extensions.DependencyInjection;

using Xunit;
namespace FARO.Test {
    public class AddonsFixture {
        public readonly List<AddonsConfiguration.EngineConfiguration> KeysIterators = new();
        public readonly List<AddonsConfiguration.EngineConfiguration> Decorators = new();
        public readonly List<AddonsConfiguration.EngineConfiguration> Validatros = new();
        public readonly List<AddonsConfiguration.EngineConfiguration> Aggregators = new();
        public readonly List<AddonsConfiguration.EngineConfiguration> Writers = new();

        public AddonsFixture() {
            var configuration = new AddonsConfig
            {
                Paths = new string[] { "test-assets" }
            };
            AddonsScanner.ScanAddons(null, configuration, actions => {
                actions.KeyIterator = KeysIterators.Add;
                actions.Decorator = Decorators.Add;
                actions.Validator = Validatros.Add;
                actions.Aggregator = Aggregators.Add;
                actions.Writer = Writers.Add;
            });
        }
    }

    public class AddonsScannerTest : IClassFixture<AddonsFixture> {
        private readonly AddonsFixture _fixture;
        public AddonsScannerTest(AddonsFixture fixture) {
            _fixture = fixture ?? throw new ArgumentNullException(nameof(fixture));
        }

        [Theory(DisplayName = "Should configure addons keysiterators")]
        [InlineData("key1", "Sample1KeysIteratorEngine", "SampleSource")]
        [InlineData("key2", "Sample2KeysIteratorEngine", "SampleSource")]
        [InlineData("test2", "Test2KeysIteratorEngine", "Test2Source")]
        public void AddonsKeysIterators(string id, string className, string source) {
            Assert.NotEmpty(_fixture.KeysIterators);
            var test = Assert.Single(_fixture.KeysIterators,
            d => string.Equals(d.Id, id, StringComparison.OrdinalIgnoreCase));
            Assert.False(test.WebApiScoped);
            Assert.NotEmpty(test.Assembly);
            Assert.Equal($"{id}.dll", test.Assembly);
            Assert.NotEmpty(test.Source);
            Assert.Equal($"FARO.Addons.Test.KeysIterators.{source}", test.Source);
            Assert.NotEmpty(test.Engine);
            Assert.Equal($"FARO.Addons.Test.KeysIterators.{className}", test.Engine);
        }

        [Theory(DisplayName = "Should configure addons decorators")]
        [InlineData("test")]
        [InlineData("test2")]
        public void AddonsDecorators(string id) {
            Assert.NotEmpty(_fixture.Decorators);
            var test = Assert.Single(_fixture.Decorators,
            d => string.Equals(d.Id, id, StringComparison.OrdinalIgnoreCase));
            Assert.True(test.WebApiScoped);
            Assert.NotEmpty(test.Assembly);
            Assert.Equal($"{id}.dll", test.Assembly);
            Assert.NotEmpty(test.Source);
            Assert.NotEmpty(test.Engine);
        }

        [Theory(DisplayName = "Should configure addons validators")]
        [InlineData("val1", "Sample1ValidatorEngine", true)]
        [InlineData("val2", "Sample2ValidatorEngine")]
        public void AddonsValidators(string id, string className, bool webApiScoped = false) {
            Assert.NotEmpty(_fixture.Validatros);
            var test = Assert.Single(_fixture.Validatros,
            d => string.Equals(d.Id, id, StringComparison.OrdinalIgnoreCase));
            Assert.Equal(webApiScoped, test.WebApiScoped);
            Assert.NotEmpty(test.Assembly);
            Assert.Equal($"{id}.dll", test.Assembly);
            Assert.Null(test.Source);
            Assert.NotEmpty(test.Engine);
            Assert.Equal($"FARO.Addons.Test.Validators.{className}", test.Engine);
        }

        [Theory(DisplayName = "Should configure addons aggregators")]
        [InlineData("test", "SampleAggregatorEngine")]
        [InlineData("test2", "Sample2AggregatorEngine")]
        [InlineData("test2.a", "Sample3AggregatorEngine")]
        [InlineData("xyz", "XYZ", true)]
        [InlineData("other-x", "XYZ2")]
        public void AddonsAggregators(string id, string className, bool webApiScoped = false) {
            Assert.NotEmpty(_fixture.Aggregators);
            var test = Assert.Single(_fixture.Aggregators,
            d => string.Equals(d.Id, id, StringComparison.OrdinalIgnoreCase));
            Assert.Equal(webApiScoped, test.WebApiScoped);
            Assert.NotEmpty(test.Assembly);
            Assert.Equal($"{id}.dll", test.Assembly);
            Assert.Null(test.Source);
            Assert.NotEmpty(test.Engine);
            Assert.Equal($"FARO.Addons.Test.Aggregators.{className}", test.Engine);
        }

        [Theory(DisplayName = "Should configure addons writers")]
        [InlineData("wri1", "Sample1WriterEngine", true)]
        [InlineData("wri2", "Sample2WriterEngine")]
        [InlineData("test", "Sample3WriterEngine")]
        public void AddonsWriters(string id, string className, bool webApiScoped = false) {
            Assert.NotEmpty(_fixture.Writers);
            var test = Assert.Single(_fixture.Writers,
            d => string.Equals(d.Id, id, StringComparison.OrdinalIgnoreCase));
            Assert.Equal(webApiScoped, test.WebApiScoped);
            Assert.NotEmpty(test.Assembly);
            Assert.Equal($"{id}.dll", test.Assembly);
            Assert.Null(test.Source);
            Assert.NotEmpty(test.Engine);
            Assert.Equal($"FARO.Addons.Test.Writers.{className}", test.Engine);
        }
    }
}
