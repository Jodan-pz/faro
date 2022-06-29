using Xunit.Abstractions;

namespace FARO.Test.BaseClasses {
    public class BaseTest {
        readonly ITestOutputHelper _output = null;

        public BaseTest(ITestOutputHelper output) {
            _output = output;
        }

        protected void WriteOut(string text) {
            if (text != null) {
                _output.WriteLine(text);
            }
        }
    }
}