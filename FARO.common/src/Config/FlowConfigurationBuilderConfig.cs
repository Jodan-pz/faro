using Microsoft.Extensions.Configuration;

namespace FARO.Common {

    public enum FlowConfigurationBuilderKind { Default, Json }

    public class FlowConfigurationBuilderConfig {
        const string SECTION = "FARO:flowconfiguration";

        public static FlowConfigurationBuilderConfig FromConfiguration(IConfiguration config) {
            var flowRunnerSection = config.GetSection(SECTION);
            var flowRunnerConfig = new FlowConfigurationBuilderConfig();
            try {
                flowRunnerSection.Bind(flowRunnerConfig);
            } catch { /* wrong configuration */
                return null;
            }
            return flowRunnerConfig;
        }

        public FlowConfigurationBuilderKind Kind { get; set; }

        public string File { get; set; }
    }
}
