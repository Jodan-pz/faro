using System.Collections.Generic;
using System.IO;

using Microsoft.Extensions.Logging;

using FARO.Common;

namespace FARO.Services.Runners {
    public class DumpFlowRunner : IFlowRunner {
        private readonly ILogger<DumpFlowRunner> _log;

        public DumpFlowRunner(ILogger<DumpFlowRunner> log) {
            _log = log ?? throw new System.ArgumentNullException(nameof(log));
        }

        public WriterStreamInfo Run(FlowItem item, Stream outputStream, IDictionary<string, object> imageArgs, IDictionary<string, object> writerArgs, int? keysLimit = null) {
            throw new System.NotImplementedException();
        }

        public void Run(FlowItem item, IDictionary<string, object> imageArgs, IDictionary<string, object> writerArgs, int? keysLimit = null) {
            _log.LogInformation($"Dump - Flow item: {item.Definition.Name}");
            _log.LogInformation(item.RunOptions.ImagePersister?.ToString());
            item.Image?.BuildSchema();
            _log.LogInformation(item.Image?.ToString());
            _log.LogInformation(item.Validator?.ToString());
            _log.LogInformation(item.Aggregator?.ToString());
            _log.LogInformation(item.Writer?.ToString());
        }
    }
}
