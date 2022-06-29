using Microsoft.Extensions.Configuration;

namespace FARO.Common {
    public class Config {
        public CacheEngineConfig CacheEngine { get; private set; }
        public AddonsConfig Addons { get; private set; }
        public ImagePersisterConfig ImagePersister { get; private set; }
        public FlowRunnerConfig FlowRunner { get; private set; }
        public FlowConfigurationBuilderConfig FlowConfiguration { get; private set; }
        public DefinitionDataServiceConfig DefinitionData { get; private set; }
        public ExpressionEvaluatorConfig Expression { get; private set; }

        public static Config FromConfiguration(IConfiguration config) {
            var ret = new Config
            {
                Expression = ExpressionEvaluatorConfig.FromConfiguration(config),
                Addons = AddonsConfig.FromConfiguration(config),
                CacheEngine = CacheEngineConfig.FromConfiguration(config),
                DefinitionData = DefinitionDataServiceConfig.FromConfiguration(config),
                ImagePersister = ImagePersisterConfig.FromConfiguration(config),
                FlowConfiguration = FlowConfigurationBuilderConfig.FromConfiguration(config),
                FlowRunner = FlowRunnerConfig.FromConfiguration(config)
            };
            return ret;
        }
    }
}
