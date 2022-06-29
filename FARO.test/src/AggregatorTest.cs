using System;
using System.Collections.Generic;
using System.Linq;

using FARO.Common;
using FARO.Common.Domain;
using FARO.Services.Aggregators.Engine.Default;
using FARO.Services.Helpers;
using FARO.Test.BaseClasses;

using Xunit;
using Xunit.Abstractions;

namespace FARO.Test {
    [Collection("Document collection")]
    public class AggregatorTest : DocumentBaseTest {
        public AggregatorTest(DocumentFixture fixture, ITestOutputHelper output) : base(fixture, output) {
            DocumentUnitOfWork.DeleteAll("aggregators");
        }

        [Fact(DisplayName = "List Aggregator")]
        public void List_Aggregator_Test() {
            var def = new AggregatorDefinition
            {
                Name = "TEST",
                Description = "TEST AGGREGATOR",
                Tags = new string[] { "PIPPO" },
                ImageId = "img1",
                Kind = AggregatorEngineKind.DEFAULT,
                Config = new Dictionary<string, dynamic>{
                    {"value", new DefaultAggregatorConfig {
                        Fields = new DefaultAggregatorConfigField[]{
                            new DefaultAggregatorConfigField{ Name = "Field1", Function = DefaultAggregatorFunction.Distinct},
                            new DefaultAggregatorConfigField{ Name = "Field2", Function = DefaultAggregatorFunction.Sum},
                            new DefaultAggregatorConfigField{ Name = "Field3", Function = DefaultAggregatorFunction.Count},
                            new DefaultAggregatorConfigField{ Name = "Field4", Function = DefaultAggregatorFunction.Max},
                            new DefaultAggregatorConfigField{ Name = "Field5", Function = DefaultAggregatorFunction.Min}
                        }
                        }
                    }
                }
            };
            var saved = DataService.CreateAggregator(def);
            var def2 = new AggregatorDefinition
            {
                Name = "TEST 2",
                Description = "GOnzo",
                Tags = new string[] { "test", "PIPPO" },
                ImageId = "img2",
                Kind = AggregatorEngineKind.DEFAULT,
                Config = new Dictionary<string, dynamic>{
                    {"value", new DefaultAggregatorConfig {
                        Fields = new DefaultAggregatorConfigField[]{
                            new DefaultAggregatorConfigField{ Name = "TheMax", Function = DefaultAggregatorFunction.Max}
                        }
                        }
                    }
                }
            };
            var saved2 = DataService.CreateAggregator(def2);
            var def3 = new AggregatorDefinition
            {
                Name = "Other test",
                Description = "AGGREGATOR TEST",
                Tags = new string[] { "test", "POLDO" },
                ImageId = "img1",
                Kind = AggregatorEngineKind.DEFAULT,
                Config = new Dictionary<string, dynamic>{
                    {"value", new DefaultAggregatorConfig {
                        Fields = new DefaultAggregatorConfigField[]{
                            new DefaultAggregatorConfigField{ Name = "Field1", Function = DefaultAggregatorFunction.Distinct},
                            new DefaultAggregatorConfigField{ Name = "Field2", Function = DefaultAggregatorFunction.Sum},
                            new DefaultAggregatorConfigField{ Name = "Field3", Function = DefaultAggregatorFunction.Count},
                            new DefaultAggregatorConfigField{ Name = "Field4", Function = DefaultAggregatorFunction.Max},
                            new DefaultAggregatorConfigField{ Name = "Field5", Function = DefaultAggregatorFunction.Min}
                        }
                    }
                    }
                }
            };

            var saved3 = DataService.CreateAggregator(def3);

            Assert.NotNull(saved);
            Assert.NotNull(saved2);
            Assert.NotNull(saved3);

            var search1 = DataService.ListAggregators("TESt", FilterMatchMode.StartsWith);
            Assert.Equal(2, search1.Count());

            var search2 = DataService.ListAggregators("tEsT", FilterMatchMode.Contains);
            Assert.Equal(3, search2.Count());

            var search3 = DataService.ListAggregators("gonzo", FilterMatchMode.Exact);
            Assert.Single(search3);

            var search4 = DataService.ListAggregators(tags: new string[] { "test" }, tagsMatchMode: TagsMatchMode.Any);
            Assert.Equal(2, search4.Count());

            var search5 = DataService.ListAggregators(tags: new string[] { "TesT", "PolDo" }, tagsMatchMode: TagsMatchMode.All);
            var allTags = Assert.Single(search5);
            Assert.Equal("Other test", allTags.Name);
        }

        [Fact(DisplayName = "Add/Delete Aggregator")]
        public void Add_Delete_Aggregator_Test() {
            var def = new AggregatorDefinition
            {
                Name = "TEST",
                Description = "TEST AGGREGATOR",
                Tags = new string[] { "test", "pippo" },
                ImageId = "image_test",
                Kind = AggregatorEngineKind.DEFAULT,
                Config = new Dictionary<string, dynamic>{
                    {"value", new DefaultAggregatorConfig {
                        Filter = "{x} != null",
                        Fields = new DefaultAggregatorConfigField[]{
                            new DefaultAggregatorConfigField{ Name = "Field1", Function = DefaultAggregatorFunction.Distinct},
                            new DefaultAggregatorConfigField{ Name = "Field1", Function = DefaultAggregatorFunction.Count},
                            new DefaultAggregatorConfigField{ Name = "Field1", Function = DefaultAggregatorFunction.Min},
                            new DefaultAggregatorConfigField{ Name = "Field1", Function = DefaultAggregatorFunction.Max},
                            new DefaultAggregatorConfigField{ Name = "Field1", Function = DefaultAggregatorFunction.Sum},
                            new DefaultAggregatorConfigField{ Name = "Field2", Function = DefaultAggregatorFunction.Sum},
                            new DefaultAggregatorConfigField{ Name = "Field3", Function = DefaultAggregatorFunction.Count},
                            new DefaultAggregatorConfigField{ Name = "Field4", Function = DefaultAggregatorFunction.Max},
                            new DefaultAggregatorConfigField{ Name = "Field5", Function = DefaultAggregatorFunction.Min}
                            }
                        }
                    }
                }
            };
            var saved = DataService.CreateAggregator(def);
            Assert.NotNull(saved);
            Assert.NotEmpty(saved.Tags);
            Assert.Contains("pippo", saved.Tags);
            Assert.Contains("test", saved.Tags);
            var checkConfig = DynamicConfigValueHelper.GetConfig<DefaultAggregatorConfig>(saved.Config);
            Assert.NotNull(checkConfig);
            Assert.NotNull(checkConfig.Filter);
            Assert.All(checkConfig.Fields, a => {
                Assert.NotEmpty(a.Name);
                Assert.True(Enum.TryParse<DefaultAggregatorFunction>(a.Function.ToString(), false, out var x));
            });
            Assert.True(DataService.DeleteAggregator(saved.Id));
        }

        [Fact(DisplayName = "Add/Update Aggregator")]
        public void Add_Update_Aggregator_Test() {
            var def = new AggregatorDefinition
            {
                Name = "TEST",
                Description = "TEST AGGREGATOR",
                Tags = new string[] { "test", "pippo" },
                ImageId = "image_test",
                Kind = AggregatorEngineKind.DEFAULT,
                Config = new Dictionary<string, dynamic>{
                    {"value", new DefaultAggregatorConfig {
                        Fields = new DefaultAggregatorConfigField[]{
                            new DefaultAggregatorConfigField{ Name = "Field1", Function = DefaultAggregatorFunction.Distinct}
                            }
                        }
                    }
                }
            };
            var saved = DataService.CreateAggregator(def);
            Assert.NotNull(saved);
            var checkConfig = DynamicConfigValueHelper.GetConfig<DefaultAggregatorConfig>(saved.Config);
            Assert.NotNull(checkConfig);

            var sField = Assert.Single(checkConfig.Fields);
            Assert.Equal("Field1", sField.Name);
            Assert.Equal(DefaultAggregatorFunction.Distinct, sField.Function);

            checkConfig.Fields = checkConfig.Fields.Union(new DefaultAggregatorConfigField[]{
                    new DefaultAggregatorConfigField { Name = "Field1", Function = DefaultAggregatorFunction.Count},
                    new DefaultAggregatorConfigField { Name = "Field1", Function = DefaultAggregatorFunction.Min},
                    new DefaultAggregatorConfigField { Name = "Field1", Function = DefaultAggregatorFunction.Max },
                    new DefaultAggregatorConfigField { Name = "Field1", Function = DefaultAggregatorFunction.Sum },
                    new DefaultAggregatorConfigField { Name = "Field2", Function = DefaultAggregatorFunction.Sum },
                    new DefaultAggregatorConfigField { Name = "Field3", Function = DefaultAggregatorFunction.Count },
                    new DefaultAggregatorConfigField { Name = "Field4", Function = DefaultAggregatorFunction.Max },
                    new DefaultAggregatorConfigField { Name = "Field5", Function = DefaultAggregatorFunction.Min }});
            saved.Config = new Dictionary<string, dynamic> { { "value", checkConfig } };
            var updated = DataService.UpdateAggregator(saved.Id, saved);
            var checkUpdatedConfig = DynamicConfigValueHelper.GetConfig<DefaultAggregatorConfig>(updated.Config);
            Assert.NotNull(checkUpdatedConfig);

            Assert.Equal(saved.Id, updated.Id);
            Assert.Equal(saved.Id, updated.Id);
            Assert.Equal(saved.Name, updated.Name);
            Assert.Equal(saved.Description, updated.Description);
            Assert.NotNull(checkUpdatedConfig.Fields);
            Assert.Equal(9, checkUpdatedConfig.Fields.Count());
            Assert.Contains(checkUpdatedConfig.Fields, field => field.Name == "Field1" && field.Function == DefaultAggregatorFunction.Distinct);
            Assert.Contains(checkUpdatedConfig.Fields, field => field.Name == "Field1" && field.Function == DefaultAggregatorFunction.Count);
            Assert.Contains(checkUpdatedConfig.Fields, field => field.Name == "Field1" && field.Function == DefaultAggregatorFunction.Min);
            Assert.Contains(checkUpdatedConfig.Fields, field => field.Name == "Field1" && field.Function == DefaultAggregatorFunction.Max);
            Assert.Contains(checkUpdatedConfig.Fields, field => field.Name == "Field1" && field.Function == DefaultAggregatorFunction.Sum);
            Assert.Contains(checkUpdatedConfig.Fields, field => field.Name == "Field2" && field.Function == DefaultAggregatorFunction.Sum);
            Assert.Contains(checkUpdatedConfig.Fields, field => field.Name == "Field3" && field.Function == DefaultAggregatorFunction.Count);
            Assert.Contains(checkUpdatedConfig.Fields, field => field.Name == "Field4" && field.Function == DefaultAggregatorFunction.Max);
            Assert.Contains(checkUpdatedConfig.Fields, field => field.Name == "Field5" && field.Function == DefaultAggregatorFunction.Min);
        }
    }
}
