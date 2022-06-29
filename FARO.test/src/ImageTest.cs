using System;
using System.Collections.Generic;

using FARO.Common.Domain;
using FARO.Test.BaseClasses;

using Xunit;
using Xunit.Abstractions;

namespace FARO.Test {

    [Collection("Document collection")]
    public class ImageTest : DocumentBaseTest {
        public ImageTest(DocumentFixture fixture, ITestOutputHelper output) : base(fixture, output) {
        }

        [Fact(DisplayName = "Add/Delete Image")]
        public void Add_Delete_Image_Test() {
            var layers = new List<LayerDefinition>();
            var items = new List<LayerFieldItemDefinition>();
            var layer = new LayerDefinition
            {
                Name = "1",
                Items = items
            };
            items.Add(new LayerFieldItemDefinition { Field = "CAMPO1", Config = "TEST" });
            items.Add(new LayerFieldItemDefinition { Field = "CAMPO2", Config = "TEST2" });
            items.Add(new LayerFieldItemDefinition { Field = "CAMPO3", Config = "TEST3" });
            layers.Add(layer);

            var def = new ImageDefinition
            {
                Name = "TEST",
                Description = "TEST IMAGE",
                KeysIterators = Array.Empty<ImageKeysIteratorsDefinition>(),
                Layers = layers
            };
            var saved = DataService.CreateImage(def);
            Assert.NotNull(saved);
            Assert.True(DataService.DeleteImage(saved.Id));
        }
    }
}
