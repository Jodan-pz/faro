using System;
using System.Collections.Generic;

using Microsoft.Extensions.Logging;

using FARO.Common;
using FARO.Common.Exceptions;

using Newtonsoft.Json;

namespace FARO.Batch {
    public class FAROBatch : IFAROBatch {
        readonly IAppArguments _appArguments;
        readonly IFlowConfigurationBuilder _flowConfigurationBuilder;
        readonly IFlowRunner _flowRunner;
        readonly ILogger<FAROBatch> _log;

        public FAROBatch(IAppSupport appSupport, IFlowConfigurationBuilder flowConfigurationBuilder, IFlowRunner flowRunner, ILogger<FAROBatch> log = null) {
            _appArguments = appSupport?.Arguments ?? throw new ArgumentNullException(nameof(appSupport));
            _flowConfigurationBuilder = flowConfigurationBuilder ?? throw new ArgumentNullException(nameof(flowConfigurationBuilder));
            _flowRunner = flowRunner ?? throw new ArgumentNullException(nameof(flowRunner));
            _log = log;
        }

        public void Start(params object[] arguments) {
            var flowId = _appArguments.FlowId;
            var flowName = _appArguments.FlowName;
            var inputArgs = _appArguments.InputArgs?.Replace(@"\", @"\\") ?? string.Empty;
            var outputArgs = _appArguments.OutputArgs?.Replace(@"\", @"\\") ?? string.Empty;
            var enableCheck = _appArguments.EnableCheck ?? false;
            var enablePersister = _appArguments.EnablePersister;
            var persisterBuildStep = _appArguments.PersisterBuildStep;
            var imageArgs = JsonConvert.DeserializeObject<IDictionary<string, object>>(inputArgs);
            var writerArgs = JsonConvert.DeserializeObject<IDictionary<string, object>>(outputArgs);
            var onError = false;
            try {
                _flowConfigurationBuilder.Build(flowId: flowId, flowName: flowName)
                                         .WithImagePersister(enablePersister, persisterBuildStep)
                                         .WithArguments(imageArgs, writerArgs)
                                         .Checked(enableCheck)
                                         .One(_flowRunner.Run);
            } catch (AggregateException aex) {
                onError = true;
                foreach (var aggEx in aex.Flatten().InnerExceptions) {
                    _log?.LogError(aggEx.Message);
                }
            } catch (ValidateResultException vex) {
                onError = true;
                foreach (var valEx in vex.Result) {
                    _log?.LogError($"{valEx.Validator.Definition.Name} - {valEx.Key} {valEx.Message}");
                }
            } catch (Exception ex) {
                onError = true;
                _log?.LogError(ex.Message);
            }
            if (onError) throw new FlowRunException("Run completed with errors.");
        }
    }
}
