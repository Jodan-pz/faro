using System.IO;

namespace FARO.Common {
    public interface IFlowConfigurationReader {
        FlowConfiguration Read(FileInfo configuration);
        FlowConfiguration Read(string configuration);
    }
}