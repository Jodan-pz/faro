using System.Collections.Generic;
using System.IO;

namespace FARO.Common {

    public interface IFlowRunner {
        void Run(FlowItem item, IDictionary<string, object> imageArgs, IDictionary<string, object> writerArgs, int? keysLimit = null);
        WriterStreamInfo Run(FlowItem item, Stream outputStream, IDictionary<string, object> imageArgs, IDictionary<string, object> writerArgs, int? keysLimit = null);
    }
}