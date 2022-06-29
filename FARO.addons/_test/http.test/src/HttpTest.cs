using System;
using System.Collections.Generic;

using FARO.Addons.Http.Decorators.Engine;
using FARO.Addons.Http.KeysIterators.Engine;
using FARO.Addons.Test;
using FARO.Common;
using FARO.Common.Domain;

using Xunit;

namespace FARO.Addons.Http.Test {

    public class HttpTest : BaseTest {

        const string CONNECTION = "https://musicbrainz.org/ws/2";

        [Fact(DisplayName = "Http - Web Api decorator engine")]
        public async void DecoratorEngine_Test() {
            var def = new DecoratorDefinition
            {
                Arguments = new List<Argument> { new Argument { Name = "artist" } },
                Source = new DecoratorSourceDefinition
                {
                    Arguments = new Dictionary<string, string?> {
                    { "connection", CONNECTION },
                    { "method", "GET" },
                    { "action", "artist" },
                    { "qs", "query={artist}&limit=1&fmt=json" },
                    { "proxy", null /*"proxy@dharma" */ },
                    { "headers", "User-Agent:Mozilla|Custom:12" },
                    { "jsonpath", "artists[0]"}
                    }
                },
                Fields = new OutputField[] { new("aname", "name"), new("acountry", "country") }
            };

            var decorator = MakeDecorator((ev, cr) => new WebApiDecoratorEngine(ev, cr),
                            def,
                            new List<ArgumentValue> { new() { Name = "artist", Value = "{artist-name}" } });

            var output = new ImageOutput();
            var row = output.AddKey(new Dictionary<string, object> { { "artist-name", "megadeth" } });
            var values = await decorator.GetValuesAsync(row);

            Assert.NotNull(values);
            Assert.NotEmpty(values);
            Assert.Equal("Megadeth", values["aname"]);
            Assert.Equal("US", values["acountry"]);
        }

        [Fact(DisplayName = "Http - Web Api keys iterator engine")]
        public void KeysEngine_Test() {
            var def = new KeysIteratorDefinition
            {
                Arguments = new List<Argument> { new() { Name = "artist" } },
                Source = new KeysIteratorSourceDefinition
                {
                    Arguments = new Dictionary<string, string?> {
                    { "connection", CONNECTION },
                    { "method", "GET" },
                    { "action", "artist" },
                    { "qs", "query={artist}&limit=2&fmt=json" },
                    { "proxy", null },
                    { "headers", "User-Agent:Mozilla" },
                    { "jsonpath", "artists[*]"}
                    }
                },
                Fields = OutputField.Array("name", "score")
            };

            var keyIter = MakeKeysIterator(() => new WebApiKeysIteratorEngine(null), def);
            var args = new Dictionary<string, object> { { "artist", "metallica" } };
            var output = new ImageOutput();
            ImageOutputRow? lastRow = null;
            keyIter.Iterate(args, key => lastRow = output.AddKey(key));

            Assert.True(output.Size > 0);
            Assert.NotNull(lastRow?.GetValue("{name}"));
            Assert.NotEqual("pearl jam", lastRow?.GetValue("{name}")?.ToString(), StringComparer.InvariantCultureIgnoreCase);
            output.IterateRows(row => Assert.Contains("metallica", row.GetValue("{name}")?.ToString(), StringComparison.InvariantCultureIgnoreCase));
        }
    }
}
