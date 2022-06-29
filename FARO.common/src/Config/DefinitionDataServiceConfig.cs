using Microsoft.Extensions.Configuration;

namespace FARO.Common {

    public enum DefinitionDataServiceConfigKind { None, Default, External }

    public class DefinitionDataServiceConfig {
        const string SECTION = "FARO:definitiondata";
        const string CONFIG = "config";

        public static DefinitionDataServiceConfig FromConfiguration(IConfiguration config) {
            var definitionDataSection = config.GetSection(SECTION);
            var definitionDataConfig = new DefinitionDataServiceConfig();
            try {
                try {
                    definitionDataSection.Bind(definitionDataConfig);
                    definitionDataConfig.Config = definitionDataSection.GetSection(CONFIG);
                } catch { /* wrong configuration */
                    return null;
                }
            } catch { /* wrong configuration */
                return null;
            }
            return definitionDataConfig;
        }

        public DefinitionDataServiceConfigKind Kind { get; set; }
        public string Assembly { get; set; }
        public string Class { get; set; }
        public string RegisterMethod { get; set; }
        public bool WebApiScoped { get; set; }
        public IConfiguration Config { get; private set; }
    }
}