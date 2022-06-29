
using FARO.Common.Domain;

namespace FARO.Common {
    public interface IFlowConfigurationBuilder {
        FlowConfiguration Build(string flowId = null, string flowName = null);
        FlowConfiguration Build(params FlowItemDefinition[] flowItemDefinitions);
        FlowConfiguration Build(ImageDefinition imageDefinition,
                                ValidatorDefinition validatorDefinition = null,
                                AggregatorDefinition aggregatorDefinition = null,
                                WriterDefinition writerDefinition = null);
    }
}