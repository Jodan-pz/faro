using System.Collections.Generic;

using FARO.Common.Domain;

using Xunit;
namespace FARO.Test {
    public class FieldDescriptionTest {

        [Fact(DisplayName = "Test Field description comparer")]
        public void CreateAndTest() {
            var fields = new HashSet<FieldDescription>();
            Assert.True(fields.Add(FieldDescription.Create("peppo")));
            Assert.False(fields.Add(FieldDescription.Create("peppo")));

            var x = FieldDescription.Create("azzo", "razzo");
            var y = FieldDescription.Create("azzo", "razzo");
            Assert.Equal(x, y);
        }
    }
}
