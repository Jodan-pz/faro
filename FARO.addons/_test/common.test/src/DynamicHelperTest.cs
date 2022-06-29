using System.Collections.Generic;
using FARO.Addons.Test;
using FARO.Common;
using FARO.Common.Domain;

using Xunit;

namespace FARO.Addons.Common.Test {

    public class DynamicHelperTest : BaseTest {
        [Theory(DisplayName = "Test Change Type of Null values")]
        [InlineData("String", null)]
        [InlineData("Int32", null)]
        [InlineData("DateTime", null)]
        [InlineData("Decimal", null)]
        [InlineData("Double", null)]
        [InlineData(null, null)]
        public void ChangeNull(string type, dynamic value) =>
        Assert.Null(DynamicHelper.ChangeType(value, type));

        [Theory(DisplayName = "Test Change Type of valid values")]
        [InlineData("String", 12)]
        [InlineData("Int32", "123")]
        [InlineData("Double", "123.23")]
        [InlineData("Decimal", "12.23")]
        [InlineData("DateTime", "2018-09-11")]
        public void ChangeValue(string type, dynamic value) =>
        Assert.Equal(type, DynamicHelper.ChangeType(value, type)?.GetType().Name);
    }
}