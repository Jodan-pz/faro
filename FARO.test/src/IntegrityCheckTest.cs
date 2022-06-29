using System;
using System.Collections.Generic;
using System.Linq;

using FARO.Common.Domain;
using FARO.Services.Aggregators.Engine.Default;
using FARO.Services.Validators.Engine.Default;
using FARO.Test.BaseClasses;

using Xunit;
using Xunit.Abstractions;

namespace FARO.Test {
    [Collection("Document collection")]
    public class IntegrityCheckTest : DocumentBaseTest {
        readonly string _flowItemConsoleId = null;
        readonly string _imageId = null;
        readonly string _validatorId = null;
        readonly string _writerId = null;

        public IntegrityCheckTest(DocumentFixture fixture, ITestOutputHelper output) : base(fixture, output) {
            #region Keys iterators
            DocumentUnitOfWork.DeleteAll<KeysIteratorDefinition>("keysiterators", k => k.Name == "test_keys" || k.Name == "test_keys2");
            var test_keys = new KeysIteratorDefinition
            {
                Name = "test_keys",
                Arguments = new Argument[] { new() { Name = "portfolioCode" } },
                Fields = OutputField.Array("instCode", "instName", "opPrice", "opDate"),
                Filter = "{opPrice} > 100 AND {instName} >= 'AAA'"
            };

            var test_keys2 = new KeysIteratorDefinition
            {
                Name = "test_keys2",
                Arguments = new Argument[] { new() { Name = "opDate" } },
                Fields = OutputField.Array("Id", "Emittente")
            };

            DataService.CreateKeysIterator(test_keys);
            DataService.CreateKeysIterator(test_keys2);
            #endregion

            #region Decorators
            DocumentUnitOfWork.DeleteAll<DecoratorDefinition>("decorators", d => d.Name == "Emittente" || d.Name == "Nazione" || d.Name == "Nazione2");
            var decEmittente = new DecoratorDefinition
            {
                Name = "Emittente",
                Arguments = new List<Argument> { new() { Name = "Emittente" } },
                Fields = OutputField.Array("Codice", "Descrizione", "Nazione")
            };
            var decNazione = new DecoratorDefinition
            {
                Name = "Nazione",
                Arguments = new List<Argument> { new() { Name = "codice" } }
            };
            DataService.CreateDecorator(decEmittente);
            DataService.CreateDecorator(decNazione);
            #endregion

            #region Image
            DocumentUnitOfWork.DeleteAll<ImageDefinition>("images", i => i.Name == "PROVA");
            var image = new ImageDefinition
            {
                Name = "PROVA",
                KeysIterators = ImageKeysIteratorsDefinition.Array(test_keys.Id, test_keys2.Id),
                Layers = new LayerDefinition[]{
                    new LayerDefinition{
                        Name = "1",
                        Items = new LayerFieldItemDefinition[]{
                                new(){ Field = "CODICE_EMITTENTE", Config = $"#decorator:{decEmittente.Id}.Codice"},
                                new(){ Field = "DES_EMITTENTE", Config = $"#decorator:{decEmittente.Id}.Descrizione"},
                                new(){ Field = "COD_NAZIONE", Config = $"#decorator:{decEmittente.Id}.Nazione"},
                                new(){ Field = "TEST", Config = "THIS_IS_A_SAMPLE_VALUE"}}
                    },
                    new LayerDefinition{
                        Name = "2",
                        Items =  new LayerFieldItemDefinition[]{
                            new(){ Field = "NAZIONE", Config = new {
                                    decorator = decNazione.Id,
                                    args = new {
                                        codice = "{COD_NAZIONE}"
                                    }}
                                }
                        }
                    },
                    // new LayerDefinition{
                    //     Name = "3",
                    //     Items =  new LayerFieldItemDefinition[]{
                    //              new(){ Field = "NAZIONE_2", Config = new {
                    //                 decorator = decNazione2.Id
                    //                 }}
                    //             }
                    // },
                    new LayerDefinition
                    {
                        Name = "4",
                        Items = new LayerFieldItemDefinition[]{
                                new(){ Field= "CHIAVE_ARG_DATA", Config ="#key:opDate"},
                                new(){ Field= "CHIAVE_RES_ID", Config = "#key:Id"},
                                new(){ Field= "CHIAVE_RES_EMITTENTE", Config = "#key:Emittente"}
                            }
                    },
                    new LayerDefinition{
                        Name = "5",
                        Items =  new LayerFieldItemDefinition[]{
                                 new(){ Field = "PROVOLA", Config = new {
                                        decorator = $"{decEmittente.Id}.Codice",
                                        args = new{
                                            Emittente = "{CHIAVE_RES_EMITTENTE}"
                                        }
                                        }},
                                 new(){ Field= "PRICE", Config = "#key:opPrice"}
                                }
                    }
                }
            };
            DataService.CreateImage(image);
            _imageId = image.Id;
            #endregion

            #region Validator
            DocumentUnitOfWork.DeleteAll<ValidatorDefinition>("validators", a => a.Name == "TEST_VALIDATOR");
            var validator = new ValidatorDefinition
            {
                Name = "TEST_VALIDATOR",
                Kind = AggregatorEngineKind.DEFAULT,
                Config = new Dictionary<string, dynamic>{
                    {"value", new DefaultValidatorConfig {
                        Rules = new DefaultValidatorConfigRule[]{
                            new (){
                                Name = "TEST",
                                Expression = "IsNullOrEmpty( {TEST} )",
                                Message = "TEST should be not empty!"
                            }
                        }
                    }
                    }
                }
            };
            var valDef = DataService.CreateValidator(validator);
            _validatorId = valDef.Id;
            #endregion

            #region Aggregator
            DocumentUnitOfWork.DeleteAll<AggregatorDefinition>("aggregators", a => a.Name == "TEST_AGGREGATION");
            var aggregator = new AggregatorDefinition
            {
                Name = "TEST_AGGREGATION",
                ImageId = image.Id,
                Kind = AggregatorEngineKind.DEFAULT,
                Config = new Dictionary<string, dynamic>{
                    {"value", new DefaultAggregatorConfig {
                        Fields = new DefaultAggregatorConfigField[]{
                            new (){
                                Name = "#key:portfolioCode",
                                Function = DefaultAggregatorFunction.Distinct
                            },
                            new (){
                                Name = "COD_NAZIONE",
                                Function = DefaultAggregatorFunction.Distinct
                            },
                            new (){
                                Name = "NAZIONE",
                                Function = DefaultAggregatorFunction.Distinct
                            },
                            new (){
                                Name = "NAZIONE",
                                Function = DefaultAggregatorFunction.Count
                            },
                            new (){
                                Name = "PRICE",
                                Function = DefaultAggregatorFunction.Min
                            },
                            new (){
                                Name = "PRICE",
                                Function = DefaultAggregatorFunction.Sum
                            }
                        },
                        Filter = "iif({CHIAVE_RES_EMITTENTE} <> 'aaa'; {NAZIONE} = 'XX'; {PRICE} > 100)"
                        }
                    }
                }
            };
            DataService.CreateAggregator(aggregator);

            #endregion

            #region Writers
            DocumentUnitOfWork.DeleteAll<WriterDefinition>("writers", w => w.Name == "CONSOLE_TEST");
            var writerConsole = new WriterDefinition
            {
                Name = "CONSOLE_TEST",
                Kind = WriterEngineKind.CONSOLE
            };
            DataService.CreateWriter(writerConsole);
            _writerId = writerConsole.Id;
            #endregion

            #region Flows
            DocumentUnitOfWork.DeleteAll<FlowItemDefinition>("flows", f => f.Name.StartsWith("TEST_FLOW_INTEGRITY"));
            var flowItemConsoleDef = new FlowItemDefinition
            {
                Name = "TEST_FLOW_INTEGRITY_TO_CONSOLE",
                ImageId = image.Id,
                AggregatorId = aggregator.Id,
                WriterId = writerConsole.Id
            };
            var fconsole = DataService.CreateFlowItem(flowItemConsoleDef);
            _flowItemConsoleId = flowItemConsoleDef.Id;
            #endregion
        }

        [Fact(DisplayName = "Check integrity of flow item")]
        public void Check_Integrity_FlowItem_Test() {
            var flowDelimCheckResult = IntegrityCheckService.CheckFlowItem(_flowItemConsoleId);
            DumpItems(flowDelimCheckResult);
            Assert.False(flowDelimCheckResult.HasErrors);
        }

        [Fact(DisplayName = "Check integrity of image item")]
        public void Check_Integrity_Image_Test() {
            Assert.True(IntegrityCheckService.CheckImage(GenerateHexString(24)).HasErrors);
            var imageCheckResult = IntegrityCheckService.CheckImage(_imageId);
            DumpItems(imageCheckResult);
            Assert.False(imageCheckResult.HasErrors);
        }

        [Fact(DisplayName = "Check image validator using creator")]
        public void Check_Integrity_CreateCheckValidator_Test() {
            var (checkValidator, _) = IntegrityCheckService.CreateChecker(_imageId);
            Assert.NotNull(checkValidator);
            Assert.IsAssignableFrom<Delegate>(checkValidator);
            Assert.False(checkValidator(_validatorId).HasErrors);
        }

        [Fact(DisplayName = "Check image writer using creator")]
        public void Check_Integrity_CreateCheckWriter_Test() {
            var (_, checkWriter) = IntegrityCheckService.CreateChecker(_imageId);
            Assert.NotNull(checkWriter);
            Assert.IsAssignableFrom<Delegate>(checkWriter);
            Assert.False(checkWriter(_writerId).HasErrors);
        }

        void DumpItems(CheckResultCollection c) {
            foreach (var item in c.Items)
                WriteOut($"{item.Area} - {item.Level} - [{item.Id}] {item.Message}");
        }

        static readonly Random random = new();

        static string GenerateHexString(int digits) {
            return string.Concat(Enumerable.Range(0, digits).Select(_ => random.Next(16).ToString("X")));
        }
    }
}
