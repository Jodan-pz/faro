using System.Collections.Generic;
using System.Linq;

using FARO.Common;
using FARO.Common.Domain;
using FARO.Test.BaseClasses;

using Xunit;
using Xunit.Abstractions;

namespace FARO.Test {
    [Collection("Document collection")]
    public class DecoratorTest : DocumentBaseTest {
        public DecoratorTest(DocumentFixture fixture, ITestOutputHelper output) : base(fixture, output) {
            DocumentUnitOfWork.DeleteAll("decorators");
        }

        [Fact(DisplayName = "List Decorator")]
        public void List_Decorator_Test() {
            var def = new DecoratorDefinition
            {
                Name = "TEST",
                Description = "TEST DECORATOR",
                Tags = new string[] { "test", "PIPPO" }
            };
            var saved = DataService.CreateDecorator(def);
            var def2 = new DecoratorDefinition
            {
                Name = "Other test",
                Description = "TEST DECORATOR",
                Tags = new string[] { "test", "poldo" }
            };
            var saved2 = DataService.CreateDecorator(def2);
            var def3 = new DecoratorDefinition
            {
                Name = "GONZO",
                Description = "My Best Test!",
                Tags = new string[] { "TEST", "PiPpo" }
            };
            var saved3 = DataService.CreateDecorator(def3);

            Assert.NotNull(saved);
            Assert.NotNull(saved2);
            Assert.NotNull(saved3);

            var search1 = DataService.ListDecorators("TESt", FilterMatchMode.StartsWith);
            Assert.Equal(2, search1.Count());

            var search2 = DataService.ListDecorators("tEsT", FilterMatchMode.Contains);
            Assert.Equal(3, search2.Count());

            var search3 = DataService.ListDecorators("gonzo", FilterMatchMode.Exact);
            Assert.Single(search3);

            var search4 = DataService.ListDecorators(tags: new string[] { "test" }, tagsMatchMode: TagsMatchMode.Any);
            Assert.Equal(3, search4.Count());

            var search5 = DataService.ListDecorators(tags: new string[] { "TesT", "PolDo" }, tagsMatchMode: TagsMatchMode.All);
            var allTags = Assert.Single(search5);
            Assert.Equal("Other test", allTags.Name);
        }

        [Fact(DisplayName = "Add/Delete Decorator")]
        public void Add_Delete_Decorator_Test() {
            var sourceDef = new DecoratorSourceDefinition
            {
                Type = "Unknown",
                Arguments = new Dictionary<string, string> { { "name", "the name" } }
            };
            var def = new DecoratorDefinition
            {
                Name = "TEST",
                Description = "TEST DECORATOR",
                Tags = new string[] { "test", "pippo" },
                Source = sourceDef,
                Arguments = new List<Argument> { new Argument { Name = "Arg1", Description = "Argument 1" },
                                             new Argument { Name = "Arg2", Description = "Argument 2" }  }
            };
            var saved = DataService.CreateDecorator(def);
            Assert.NotNull(saved);
            Assert.NotEmpty(saved.Tags);
            Assert.Contains("pippo", saved.Tags);
            Assert.Contains("test", saved.Tags);
            Assert.True(DataService.DeleteDecorator(saved.Id));
        }

        [Fact(DisplayName = "Add/Update Decorator")]
        public void Add_Update_Decorator_Test() {
            var sourceDef = new DecoratorSourceDefinition
            {
                Type = "Unknown",
                Arguments = new Dictionary<string, string> { { "name", "the name" } }
            };
            var def = new DecoratorDefinition
            {
                Name = "TEST",
                Description = "TEST DECORATOR",
                Source = sourceDef,
                Arguments = new List<Argument> { new Argument { Name = "Arg1", Description = "Argument 1" },
                                             new Argument { Name = "Arg2", Description = "Argument 2" }  }
            };
            var saved = DataService.CreateDecorator(def);
            Assert.NotNull(saved);
            Assert.Null(saved.Fields);

            saved.Fields = OutputField.Array("Field1", "Field2");
            var updated = DataService.UpdateDecorator(saved.Id, saved);
            Assert.Equal(saved.Id, updated.Id);
            Assert.Equal(saved.Name, updated.Name);
            Assert.Equal(saved.Description, updated.Description);
            Assert.Equal(saved.Source.Type, updated.Source.Type);
            Assert.Equal(saved.Source.Arguments, updated.Source.Arguments);
            Assert.NotNull(updated.Fields);
            Assert.Contains("Field1", updated.Fields.Select(f => f.Name));
            Assert.Contains("Field2", updated.Fields.Select(f => f.Name));
        }

        [Fact(DisplayName = "Constant decorator engine")]
        public async void ConstantEngine_Test() {
            var decorator = EngineFactory.CreateDecorator(SystemDecoratorKind.Constant, "MY VALUE");
            Assert.NotNull(decorator);
            var values = await decorator.GetValuesAsync(new ImageOutputRow());
            var value = Assert.Single(values);
            Assert.Equal("MY VALUE", value.Value);
            Assert.Equal(decorator.Definition.Id, value.Key);
        }

        [Fact(DisplayName = "Expression decorator engine with date expression")]
        public async void ExpressionDecoratorEngineWithDate_Test() {
            var decorator = EngineFactory.CreateDecorator(SystemDecoratorKind.Expression, $"Now.ToString('dd/MM/yyyy')");
            Assert.NotNull(decorator);
            var values = await decorator.GetValuesAsync(new ImageOutputRow());
            var value = Assert.Single(values);
            Assert.Equal(System.DateTime.Now.ToString("dd/MM/yyyy"), value.Value);
            Assert.Equal(decorator.Definition.Id, value.Key);
        }


        [Fact(DisplayName = "Expression decorator engine with expression")]
        public async void ExpressionDecoratorEngineWithMath_Test() {
            const int VarValue = 100, VarMultiply = 12;
            var decorator = EngineFactory.CreateDecorator(SystemDecoratorKind.Expression, $"{{VAR_A}} * {VarMultiply}");
            Assert.NotNull(decorator);
            var row = new ImageOutputRow();
            row.SetValue("VAR_A", VarValue);
            var values = await decorator.GetValuesAsync(row);
            var value = Assert.Single(values);
            Assert.Equal(VarValue * VarMultiply, value.Value);
            Assert.Equal(decorator.Definition.Id, value.Key);
        }

        [Fact(DisplayName = "Expression decorator engine with dates expression")]
        public async void ExpressionDecoratorEngineWithDates_Test() {
            var decorator = EngineFactory.CreateDecorator(SystemDecoratorKind.Expression, $"IsGreaterInMonths( ParseDate({{VAR_A}}; 'yyyy-MM-ddT00:00:00'); ParseDate({{VAR_B}};'yyyy-MM-ddT00:00:00'); 6 )");
            Assert.NotNull(decorator);
            var row = new ImageOutputRow();
            row.SetValue("VAR_A", "2018-01-01T00:00:00");
            row.SetValue("VAR_B", "2019-02-01T00:00:00");
            var values = await decorator.GetValuesAsync(row);
            var value = Assert.Single(values);
            Assert.True((bool)value.Value);
            Assert.Equal(decorator.Definition.Id, value.Key);
        }

        [Theory(DisplayName = "Expression decorator engine with falsy boolean expression")]
        [InlineData("false")]
        [InlineData("NOT true")]
        [InlineData("{value} > 10", 9)]
        [InlineData("{value} = 'TEST'", "test")]
        public async void ExpressionDecoratorEngineWithFalsyBoolean_Test(string expression, params object[] exprValues) {
            var decorator = EngineFactory.CreateDecorator(SystemDecoratorKind.Expression, expression);
            Assert.NotNull(decorator);
            var row = new ImageOutputRow();
            var index = 0;
            ExpressionEvaluator.ForEachField(expression, (field, orig, _) => row.SetValue(field, exprValues[index++]));
            var values = await decorator.GetValuesAsync(row);
            var value = Assert.Single(values);
            Assert.False((bool)value.Value);
            Assert.Equal(decorator.Definition.Id, value.Key);
        }

        [Theory(DisplayName = "Expression decorator engine with truly boolean expression")]
        [InlineData("true")]
        [InlineData("NOT false")]
        [InlineData("{value}<={other}", 0, 0.01)]
        [InlineData("substring({value};5;3) = {other}", "SalesMed.csv", "Med")]
        public async void ExpressionDecoratorEngineWithTrulyBoolean_Test(string expression, params object[] exprValues) {
            var decorator = EngineFactory.CreateDecorator(SystemDecoratorKind.Expression, expression);
            Assert.NotNull(decorator);
            var row = new ImageOutputRow();
            var index = 0;
            ExpressionEvaluator.ForEachField(expression, (field, orig, _) => row.SetValue(field, exprValues[index++]));
            var values = await decorator.GetValuesAsync(row);
            var value = Assert.Single(values);
            Assert.True((bool)value.Value);
            Assert.Equal(decorator.Definition.Id, value.Key);
        }

        [Fact(DisplayName = "Expression decorator engine with deep IIF expression")]
        public async void ExpressionDecoratorEngineWithDeepIIF_Test() {
            var expr = "iif( {ASSET_CLASS} = 'FUND_SHARE' ; '998' ; iif( {ASSET_CLASS} = 'EQUITY'; '012'; iif( {ASSET_CLASS} = 'CURRENCY' OR {ASSET_CLASS}  = 'CASH' ; '100'; iif (  {ASSET_CLASS}  = 'FIXED_INCOME' AND {ASSET_GROUP} = 'CORPORATE' ; '005';  iif( {ASSET_CLASS}  = 'FIXED_INCOME' ; '001'; '099' ) ) ) ) )";
            var decorator = EngineFactory.CreateDecorator(SystemDecoratorKind.Expression, expr);
            Assert.NotNull(decorator);
            var row = new ImageOutputRow();
            row.SetValue("ASSET_CLASS", "FIXED_INCOME");
            row.SetValue("ASSET_GROUP", "CORPORATE");
            var values = await decorator.GetValuesAsync(row);
            var value = Assert.Single(values);
            Assert.Equal("005", value.Value);
            Assert.Equal(decorator.Definition.Id, value.Key);
        }

        [Fact(DisplayName = "Expression decorator engine with Math expression")]
        public async void ExpressionDecoratorEngineWithMath2_Test() {
            const int VarValue = -100; double varMultiply = 49;
            var decorator = EngineFactory.CreateDecorator(SystemDecoratorKind.Expression, $"abs( {{VAR_A}} ) * sqrt( {varMultiply} )");
            Assert.NotNull(decorator);
            var row = new ImageOutputRow();
            row.SetValue("VAR_A", VarValue);
            var values = await decorator.GetValuesAsync(row);
            var value = Assert.Single(values);
            Assert.Equal(System.Math.Abs(VarValue) * System.Math.Sqrt(varMultiply), value.Value);
            Assert.Equal(decorator.Definition.Id, value.Key);
        }

        [Theory(DisplayName = "Expression decorator engine with expression ISNULLOREMPTY (false)")]
        [InlineData("null")]
        [InlineData("aaa")]
        [InlineData(12)]
        public async void ExpressionDecoratorEngineWithFalseISNULLOREMPTY_Test(object data) {
            var decorator = EngineFactory.CreateDecorator(SystemDecoratorKind.Expression, $"isnullorempty({{data}})");
            Assert.NotNull(decorator);
            var row = new ImageOutputRow();
            row.SetValue("data", data);
            var values = await decorator.GetValuesAsync(row);
            var value = Assert.Single(values);
            Assert.False((bool)value.Value);
            Assert.Equal(decorator.Definition.Id, value.Key);
        }

        [Theory(DisplayName = "Expression decorator engine with expression ISNULLOREMPTY (true)")]
        [InlineData("")]
        [InlineData("  ")]
        [InlineData(null)]
        public async void ExpressionDecoratorEngineWithTrueISNULLOREMPTY_Test(object data) {
            var decorator = EngineFactory.CreateDecorator(SystemDecoratorKind.Expression, $"isnullorempty({{data}})");
            Assert.NotNull(decorator);
            var row = new ImageOutputRow();
            row.SetValue("data", data);
            var values = await decorator.GetValuesAsync(row);
            var value = Assert.Single(values);
            Assert.True((bool)value.Value);
            Assert.Equal(decorator.Definition.Id, value.Key);
        }

        [Fact(DisplayName = "Expression decorator engine with expression COALESCE")]
        public async void ExpressionDecoratorEngineWithCOALESCE_Test() {
            const int VarValue = 100;
            var decorator = EngineFactory.CreateDecorator(SystemDecoratorKind.Expression, $"coalesce( null; {{VAR_B}}; {{VAR_A}} )");
            Assert.NotNull(decorator);
            var row = new ImageOutputRow();
            row.SetValue("VAR_A", null);
            row.SetValue("VAR_B", VarValue);
            var values = await decorator.GetValuesAsync(row);
            var value = Assert.Single(values);
            Assert.Equal(VarValue, value.Value);
            Assert.Equal(decorator.Definition.Id, value.Key);
        }

        [Fact(DisplayName = "Expression decorator engine with expression NullVar")]
        public async void ExpressionDecoratorEngineWithNullVar_Test() {
            var decorator = EngineFactory.CreateDecorator(SystemDecoratorKind.Expression, $"nullvar( null ) * nullvar( 1 )");
            Assert.NotNull(decorator);
            var row = new ImageOutputRow();
            var values = await decorator.GetValuesAsync(row);
            var value = Assert.Single(values);
            Assert.Null(value.Value);
            Assert.Equal(decorator.Definition.Id, value.Key);
        }

        [Theory(DisplayName = "Expression decorator engine with expression NullVar falsy comparisons")]
        [InlineData("nullvar( 'a' ) > nullvar( null )")]
        [InlineData("nullvar( null ) > nullvar( null )")]
        [InlineData("nullvar( null ) = nullvar( 'test' )")]
        public async void ExpressionDecoratorEngineWithNullVar2_Test(string expression) {
            var decorator = EngineFactory.CreateDecorator(SystemDecoratorKind.Expression, expression);
            Assert.NotNull(decorator);
            var row = new ImageOutputRow();
            var values = await decorator.GetValuesAsync(row);
            var value = Assert.Single(values);
            Assert.False((bool)value.Value);
            Assert.Equal(decorator.Definition.Id, value.Key);
        }

        [Theory(DisplayName = "Expression decorator engine with expression NullVar truly comparisons")]
        [InlineData("nullvar( null ) = nullvar( null )")]
        [InlineData("nullvar( 1 ) > nullvar( 0 )")]
        [InlineData("nullvar( nullvar( 12 ) / nullvar( 2 ) ) = nullvar(6)")]
        public async void ExpressionDecoratorEngineWithNullVar3_Test(string expression) {
            var decorator = EngineFactory.CreateDecorator(SystemDecoratorKind.Expression, expression);
            Assert.NotNull(decorator);
            var row = new ImageOutputRow();
            var values = await decorator.GetValuesAsync(row);
            var value = Assert.Single(values);
            Assert.True((bool)value.Value);
            Assert.Equal(decorator.Definition.Id, value.Key);
        }

        [Fact(DisplayName = "Expression decorator engine with expression IIF")]
        public async void ExpressionDecoratorEngineWithIIF_Test() {
            const int VarValue = 499;
            const string VarValue2 = "TEST";
            var decorator = EngineFactory.CreateDecorator(SystemDecoratorKind.Expression, $"coalesce( null; iif({{VAR_B}} < 400;1;null); {{VAR_A}} )");
            Assert.NotNull(decorator);
            var row = new ImageOutputRow();
            row.SetValue("VAR_A", VarValue2);
            row.SetValue("VAR_B", VarValue);
            var values = await decorator.GetValuesAsync(row);
            var value = Assert.Single(values);
            Assert.Equal(VarValue2, value.Value);
            Assert.Equal(decorator.Definition.Id, value.Key);
        }

        [Theory(DisplayName = "Expression decorator engine with expression Substring")]
        [InlineData("TEST", "TEST")]
        [InlineData("TEST", "ST", 2)]
        [InlineData("TEST", "EST", 1, 3)]
        [InlineData("TEST", "EST", 1, 13)]

        public async void ExpressionDecoratorEngineWithSubstring_Test(string initValue, string expected, int? from = null, int? to = null) {
            var varValue = initValue;
            var expression = $" {{VAR_A}} ";
            if (from != null) expression += $"; {from}";
            if (to != null) expression += $"; {to}";
            var decorator = EngineFactory.CreateDecorator(SystemDecoratorKind.Expression, $"substring({expression})");
            Assert.NotNull(decorator);
            var row = new ImageOutputRow();
            row.SetValue("VAR_A", varValue);
            var values = await decorator.GetValuesAsync(row);
            var value = Assert.Single(values);
            Assert.Equal(expected, value.Value);
            Assert.Equal(decorator.Definition.Id, value.Key);
        }

        [Theory(DisplayName = "Expression decorator engine with iif and isNull")]
        [InlineData(null, 0)]
        [InlineData(123, 123)]
        public async void ExpressionDecoratorEngineWithIIFandISNULL_Test(object initValue, object expected) {
            var varValue = initValue;
            var decorator = EngineFactory.CreateDecorator(SystemDecoratorKind.Expression, $"iif( isNull({{VAR_A}}); 0; {{VAR_A}} )");
            Assert.NotNull(decorator);
            var row = new ImageOutputRow();
            row.SetValue("VAR_A", varValue);
            var values = await decorator.GetValuesAsync(row);
            var value = Assert.Single(values);
            Assert.Equal(expected, value.Value);
            Assert.Equal(decorator.Definition.Id, value.Key);
        }

        [Fact(DisplayName = "Expression decorator engine with expression with null")]
        public async void ExpressionDecoratorEngineWithNull_Test() {
            object varValue = null;
            var decorator = EngineFactory.CreateDecorator(SystemDecoratorKind.Expression, $"iif( NullVar({{VAR_A}}) <= NullVar(10); 13; null )");
            Assert.NotNull(decorator);
            var row = new ImageOutputRow();
            row.SetValue("VAR_A", varValue);
            var values = await decorator.GetValuesAsync(row);
            var value = Assert.Single(values);
            Assert.Null(value.Value);
            Assert.Equal(decorator.Definition.Id, value.Key);
        }

        [Fact(DisplayName = "Expression decorator engine with expression IIF (switch)")]
        public async void ExpressionDecoratorEngineWithIIFAsSwitch_Test() {
            const string VarValue = "TEST";
            const string VarValue2 = "RETEST";
            var decorator = EngineFactory.CreateDecorator(SystemDecoratorKind.Expression, "iif( {VAR_A} = 'TEST'; 'A'; iif( {VAR_A} = 'RETEST'; 'C'; 'D' ))");
            Assert.NotNull(decorator);
            var row = new ImageOutputRow();
            row.SetValue("VAR_A", VarValue);
            var values = await decorator.GetValuesAsync(row);
            var value = Assert.Single(values);
            Assert.Equal("A", value.Value);
            Assert.Equal(decorator.Definition.Id, value.Key);
            row.SetValue("VAR_A", VarValue2);
            var values2 = await decorator.GetValuesAsync(row);
            var value2 = Assert.Single(values2);
            Assert.Equal("C", value2.Value);
            row.SetValue("VAR_A", "NO_CASE");
            var values3 = await decorator.GetValuesAsync(row);
            var value3 = Assert.Single(values3);
            Assert.Equal("D", value3.Value);
        }

        [Fact(DisplayName = "Expression decorator engine with key ref in expression")]
        public async void ExpressionDecoratorEngineWithKeyRef_Test() {
            const int VarValue = 12324, VarMultiply = 4;
            var decorator = EngineFactory.CreateDecorator(SystemDecoratorKind.Expression, $"{{#key:VAR_A}} * {VarMultiply}");
            Assert.NotNull(decorator);
            var imgOut = new ImageOutput();
            var row = imgOut.AddKey(new Dictionary<string, object> { { "VAR_A", VarValue } });
            var values = await decorator.GetValuesAsync(row);
            var value = Assert.Single(values);
            Assert.Equal(VarValue * VarMultiply, value.Value);
            Assert.Equal(decorator.Definition.Id, value.Key);
        }

        [Fact(DisplayName = "Key decorator engine")]
        public async void KeyEngine_Test() {
            var decorator = EngineFactory.CreateDecorator(SystemDecoratorKind.Key, "Test");
            Assert.NotNull(decorator);

            // first test null key
            var values = await decorator.GetValuesAsync(new ImageOutputRow());
            var value = Assert.Single(values);
            Assert.Equal(decorator.Definition.Id, value.Key);
            Assert.Null(value.Value);

            // test valid key
            var io = new ImageOutput();
            var row = io.AddKey(new Dictionary<string, object> { { "Test", "Key Sample Value" } });
            values = await decorator.GetValuesAsync(row);
            value = Assert.Single(values);
            Assert.Equal(decorator.Definition.Id, value.Key);
            Assert.Equal("Key Sample Value", value.Value);
        }
    }
}
