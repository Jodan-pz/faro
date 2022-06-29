using System.Collections.Generic;
using System.Linq;

using FARO.Common.Domain;
using FARO.Common.Helpers;
using FARO.Test.BaseClasses;

using Xunit;
using Xunit.Abstractions;

namespace FARO.Test {
    [Collection("Document collection")]
    public class KeysIteratorTest : DocumentBaseTest {
        public KeysIteratorTest(DocumentFixture fixture, ITestOutputHelper output) : base(fixture, output) {
            DocumentUnitOfWork.DeleteAll("keysiterators");
        }

        [Fact(DisplayName = "Add/Delete KeysIterator")]
        public void Add_Delete_KeysIterator_Test() {
            var sourceDef = new KeysIteratorSourceDefinition
            {
                Type = "Unknown",
                Arguments = new Dictionary<string, string> { { "name", "the name" } }
            };
            var def = new KeysIteratorDefinition
            {
                Name = "TEST",
                Description = "TEST KEYS ITERATOR",
                Source = sourceDef,
                Arguments = new List<Argument> { new Argument { Name = "Arg1", Description = "Argument 1" },
                                                 new Argument { Name = "Arg2", Description = "Argument 2" }  }
            };
            var saved = DataService.CreateKeysIterator(def);
            Assert.NotNull(saved);
            Assert.True(DataService.DeleteKeysIterator(saved.Id));
        }

        [Fact(DisplayName = "Add/Update KeysIterator")]
        public void Add_Update_KeysIterator_Test() {
            var sourceDef = new KeysIteratorSourceDefinition
            {
                Type = "Unknown",
                Arguments = new Dictionary<string, string> { { "name", "the name" } }
            };
            var def = new KeysIteratorDefinition
            {
                Name = "TEST",
                Description = "TEST KEYSITERATOR",
                Source = sourceDef,
                Arguments = new List<Argument> { new Argument { Name = "Arg1", Description = "Argument 1" },
                                                 new Argument { Name = "Arg2", Description = "Argument 2" }  }
            };
            var saved = DataService.CreateKeysIterator(def);
            Assert.NotNull(saved);
            Assert.Null(saved.Fields);
            Assert.DoesNotContain(saved.Arguments, a => a.Name == "Arg3");

            saved.Fields = OutputField.Array("Field1", "Field2");
            saved.Arguments = new List<Argument>(saved.Arguments)
            {
                new Argument { Name = "Arg3", Description = "Argument 3" }
            };
            var updated = DataService.UpdateKeysIterator(saved.Id, saved);
            Assert.Equal(saved.Id, updated.Id);
            Assert.Equal(saved.Name, updated.Name);
            Assert.Equal(saved.Description, updated.Description);
            Assert.Equal(saved.Source.Type, updated.Source.Type);
            Assert.Equal(saved.Source.Arguments, updated.Source.Arguments);
            Assert.Contains(updated.Arguments, a => a.Name == "Arg3");
            Assert.NotNull(updated.Fields);
            Assert.Contains("Field1", updated.Fields.Select(f => f.Name));
            Assert.Contains("Field2", updated.Fields.Select(f => f.Name));
        }

        [Fact(DisplayName = "Image keys iterators")]
        public void ImageKeysIterator_Test() {
            var def = new KeysIteratorDefinition
            {
                Name = "Key Artist",
                Arguments = new List<Argument> { new Argument { Name = "artist" } },
                Fields = OutputField.Array("name", "score")
            };

            var def2 = new KeysIteratorDefinition
            {
                Name = "Key Code",
                Arguments = new List<Argument> { new Argument { Name = "code" } },
                Fields = OutputField.Array("description")
            };

            var savedDef = DataService.CreateKeysIterator(def);
            var savedDef2 = DataService.CreateKeysIterator(def2);
            Assert.NotNull(savedDef);
            Assert.NotNull(savedDef2);

            var img = new ImageDefinition
            {
                Name = "TEST",
                KeysIterators = new ImageKeysIteratorsDefinition[]{
                new ImageKeysIteratorsDefinition(def.Id){
                    Arguments = new Dictionary<string,string>{
                        {"artist","other"}
                    },
                    Fields = new Dictionary<string,string>{
                        {"name","artistName"},
                        {"score", "artistScore"}
                    }
                },
                new ImageKeysIteratorsDefinition(def2.Id){
                    Arguments = new Dictionary<string,string>{
                        {"code","artistName"}
                    },
                    Fields = new Dictionary<string,string>{
                        {"description", "mazz"}
                    }
                }
            }
            };

            var savedImg = DataService.CreateImage(img);
            Assert.NotNull(savedImg);

            var imageArgs = DefinitionSupportService.GetImageArguments(savedImg);
            Assert.NotNull(imageArgs);
            Assert.NotEmpty(imageArgs);
            var imgArg = Assert.Single(imageArgs);
            Assert.Equal("other", imgArg.Name);

            var imageFields = DefinitionSupportService.GetImageOutputFields(savedImg.Id);
            Assert.NotNull(imageFields);
            Assert.NotEmpty(imageFields);
            Assert.Equal(4, imageFields.Count());
            var values = new string[] {
                PrefixHelper.KeyName("other"),
                PrefixHelper.KeyName("artistName"),
                PrefixHelper.KeyName("artistScore"),
                PrefixHelper.KeyName("mazz") };
            Assert.All(imageFields, f => Assert.Contains(f, values));
            Assert.True(DataService.DeleteImage(img.Id));
        }

        [Fact(DisplayName = "Image keys iterators (recursive)")]
        public void ImageKeysIteratorRecursive_Test() {
            var def = new KeysIteratorDefinition
            {
                Arguments = new List<Argument> { new Argument { Name = "code" } },
                Fields = OutputField.Array("code", "name", "score"),
            };
            var savedDef = DataService.CreateKeysIterator(def);
            Assert.NotNull(savedDef);
            var img = new ImageDefinition
            {
                Name = "TEST",
                KeysIterators = new ImageKeysIteratorsDefinition[]{
                new ImageKeysIteratorsDefinition(def.Id){
                    Fields = new Dictionary<string,string>{
                        {"code", "parentCode"},
                        {"name","parentName"},
                        {"score", "parentScore"}
                    }
                },
                new ImageKeysIteratorsDefinition(def.Id){
                    Arguments = new Dictionary<string,string>{
                        {"code","parentCode"}
                    },
                    Fields = new Dictionary<string,string>{
                        {"code", "childCode"},
                        {"name", "childName"},
                        {"score", "childScore"}
                    }
                }
            }
            };

            var savedImg = DataService.CreateImage(img);
            Assert.NotNull(savedImg);

            var imageArgs = DefinitionSupportService.GetImageArguments(savedImg);
            Assert.NotNull(imageArgs);
            Assert.NotEmpty(imageArgs);
            var imgArg = Assert.Single(imageArgs);
            Assert.Equal("code", imgArg.Name);

            var imageFields = DefinitionSupportService.GetImageOutputFields(savedImg.Id);
            Assert.NotNull(imageFields);
            Assert.NotEmpty(imageFields);
            Assert.Equal(7, imageFields.Count());
            var values = new string[] {
                PrefixHelper.KeyName("code"),
                PrefixHelper.KeyName("parentName"),
                PrefixHelper.KeyName("parentScore"),
                PrefixHelper.KeyName("parentCode"),
                PrefixHelper.KeyName("childName"),
                PrefixHelper.KeyName("childScore"),
                PrefixHelper.KeyName("childCode")};
            Assert.All(imageFields, f => Assert.Contains(f, values));
            Assert.True(DataService.DeleteImage(img.Id));
        }

        [Theory(DisplayName = "Range Keys Iterator")]
        [InlineData(1, 10, 2, 5)]
        [InlineData(4, 24, -2, 11)]
        [InlineData(-15, -3, 1, 13)]
        [InlineData(-15, -3, -1, 13)]
        public void RangeKeysIterator_Test(int start, int end, int step, int size) {
            var def = new KeysIteratorDefinition
            {
                Source = new KeysIteratorSourceDefinition
                {
                    Type = KeysIteratorSourceType.RANGE,
                    Arguments = new Dictionary<string, string> {
                        { "start", start.ToString() },
                        { "end", end.ToString() },
                        { "step", step.ToString() } }
                },
                Fields = OutputField.Array("Number")
            };
            var keysCount = 0;
            EngineFactory.CreateKeysIterator(KeysIteratorScopedDefinition.Create(def))
                         .Iterate(new Dictionary<string, object>(),
                                  k => { Assert.Contains("Number", k); keysCount++; });
            Assert.Equal(size, keysCount);
        }
    }
}
