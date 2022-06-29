using System.IO;

using FARO.Test.BaseClasses;

using Xunit;
using Xunit.Abstractions;

namespace FARO.Test {
    [Collection("Document collection")]
    public class FlowRunTest : DocumentBaseTest {
        public FlowRunTest(DocumentFixture fixture, ITestOutputHelper output) : base(fixture, output) {
            if (File.Exists("test-assets/test.out")) File.Delete("test-assets/test.out");
        }

        [Fact(DisplayName = "Build a flow configuration using file reader")]
        public void Run_Flow_Configuration_Reader_Test() {
            var flowConfiguration = FlowConfigurationReader.Read(new FileInfo("test-assets/test.json"));
            Assert.NotNull(flowConfiguration);
            string[] args =  { "opDate=2018-09-30",
                               "portfolioCode=5930000",
                               "refDate=2018-08-31",
                               "wri_file=test-assets/test.out",
                               "wri_debug=true" };

            flowConfiguration.WithImagePersister(true)
                             .WithArguments(args)
                             .All((flowItem, imageArgs, writerArgs) => {
                                 Assert.NotNull(flowItem);
                                 Assert.NotNull(imageArgs);
                                 Assert.NotNull(writerArgs);
                                 Assert.NotEmpty(imageArgs);
                                 Assert.NotEmpty(writerArgs);
                                 Assert.Contains("opDate", imageArgs.Keys);
                                 Assert.Contains("portfolioCode", imageArgs.Keys);
                                 Assert.Contains("refDate", imageArgs.Keys);
                                 Assert.Contains("file", writerArgs.Keys);
                                 Assert.Contains("debug", writerArgs.Keys);
                                 Assert.Equal("2018-09-30", imageArgs["opDate"]);
                                 Assert.Equal("5930000", imageArgs["portfolioCode"]);
                                 Assert.Equal("2018-08-31", imageArgs["refDate"]);
                                 Assert.Equal("test-assets/test.out", writerArgs["file"]);
                                 Assert.Equal("true", writerArgs["debug"]);
                                 Assert.Contains("TEST", flowItem.Definition.Name);

                                 DumpFlowRunner.Run(flowItem, imageArgs, writerArgs);
                                 FlowRunner.Run(flowItem, imageArgs, writerArgs);
                             });
        }
    }
}
