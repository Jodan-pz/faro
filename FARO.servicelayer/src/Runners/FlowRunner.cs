using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;

using Microsoft.Extensions.Logging;

using FARO.Common;
using FARO.Common.Domain;
using FARO.Common.Exceptions;
using FARO.Common.Helpers;
using static FARO.Common.Constants;

namespace FARO.Services.Runners {
    public class FlowRunner : IFlowRunner {
        readonly IFlowItemImagePersister _imagePersister;
        readonly IIntegrityCheckService _checkService;
        readonly ILogger<FlowRunner> _log;

        public FlowRunner(IFlowItemImagePersister imagePersister = null,
                          IIntegrityCheckService checkService = null,
                          ILogger<FlowRunner> log = null) {
            _imagePersister = imagePersister;
            _checkService = checkService;
            _log = log;
        }

        public WriterStreamInfo Run(FlowItem item, Stream outputStream, IDictionary<string, object> imageArgs, IDictionary<string, object> writerArgs, int? keysLimit = null) => InternalRun(item, outputStream, imageArgs, writerArgs, keysLimit);
        public void Run(FlowItem item, IDictionary<string, object> imageArgs, IDictionary<string, object> writerArgs, int? keysLimit = null) => InternalRun(item, null, imageArgs, writerArgs, keysLimit);

        private WriterStreamInfo InternalRun(FlowItem item, Stream outputStream, IDictionary<string, object> imageArgs, IDictionary<string, object> writerArgs, int? keysLimit = null) {
            if (item == null) return null;
            WriterStreamInfo ret = null;

            var flowWatch = Stopwatch.StartNew();
            _log?.LogInformation($"Flow item: {item.Definition.Name}");

            var flowStepWatch = Stopwatch.StartNew();

            // check flow
            if (item.RunOptions.Check) CheckFlowItem(item);
            flowStepWatch.Stop();
            _log?.LogInformation("Check       time: {0:G}", flowStepWatch.Elapsed);

            flowStepWatch.Restart();
            // init persister
            var output = _imagePersister?.Init(item, imageArgs) ?? new ImageOutput();
            flowStepWatch.Stop();
            _log?.LogInformation("Persister   time: {0:G}", flowStepWatch.Elapsed);

            flowStepWatch.Restart();
            // prepare image
            item.Image?.BuildSchema();
            flowStepWatch.Stop();
            _log?.LogInformation("Schema      time: {0:G}", flowStepWatch.Elapsed);

            flowStepWatch.Restart();
            // execute iterator
            item.Image?.IterateKeys(imageArgs, key => {
                // add row with key (args+result)
                output.AddKey(key);
                return (keysLimit ?? 0) <= 0 || output.Size < keysLimit;
            });
            flowStepWatch.Stop();
            _log?.LogInformation("Keys        time: {0:G}", flowStepWatch.Elapsed);

            flowStepWatch.Restart();
            // rows eval layers
            ParallelHelper.ForEach(output.Partitioner(DEFAULT_PART_CHUNK_SIZE), item.Image.EvalLayers);
            flowStepWatch.Stop();
            _log?.LogInformation("Image       time: {0:G}", flowStepWatch.Elapsed);

            flowStepWatch.Restart();
            // validate image
            var validate = item.Validator?.Validate(output);
            flowStepWatch.Stop();
            _log?.LogInformation("Validator   time: {0:G}", flowStepWatch.Elapsed);
            if (validate != null && !validate.Valid) throw new ValidateResultException(item.Validator, validate);

            flowStepWatch.Restart();
            // aggregate image
            output = item.Aggregator?.Aggregate(output) ?? output;
            flowStepWatch.Stop();
            _log?.LogInformation("Aggregator  time: {0:G}", flowStepWatch.Elapsed);

            flowStepWatch.Restart();
            // write image
            if (outputStream != null) {
                ret = item.Writer?.WriteToStream(output, new WriterStream(outputStream), writerArgs);
            } else {
                item.Writer?.Write(output, writerArgs);
            }
            flowStepWatch.Stop();
            _log?.LogInformation("Writer      time: {0:G}", flowStepWatch.Elapsed);

            flowWatch.Stop();
            _log?.LogInformation("Flow done   time: {0:G}", flowWatch.Elapsed);
            return ret;
        }

        private void CheckFlowItem(FlowItem flowItem) {
            var exc = new List<Exception>();
            _log?.LogInformation("Checking {flowName}...", flowItem.Definition.Name);
            var checkResult = _checkService.CheckFlowItem(flowItem.Definition.Id);
            if (!checkResult.HasErrors) {
                _log?.LogInformation("...flow passed integrity check!");
            } else {
                foreach (var ck in checkResult.Items.Where(i => i.Level == CheckResultLevel.Error ||
                                                                i.Level == CheckResultLevel.Warning)) {
                    exc.Add(new ApplicationException($"{ck.Area} [{ck.Id}] - {ck.Message}"));
                }
            }
            if (exc.Count > 0) throw new AggregateException(exc);
        }
    }
}
