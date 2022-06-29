using Microsoft.Extensions.Configuration;

namespace FARO.Common {
    public class FlowRunnerConfig {
        const string SECTION = "FARO:flowrunner";

        public static FlowRunnerConfig FromConfiguration(IConfiguration config) {
            var flowRunnerSection = config.GetSection(SECTION);
            var flowRunnerConfig = new FlowRunnerConfig();
            try {
                flowRunnerSection.Bind(flowRunnerConfig);
            } catch { /* wrong configuration */
                return null;
            }
            return flowRunnerConfig;
        }

        public string Assembly { get; set; }
        public string Class { get; set; }
        public bool WebApiScoped { get; set; }
    }
}
