using Microsoft.Extensions.Configuration;

namespace FARO.Common {
    public class AddonsConfig {
        const string SECTION = "FARO:addons";
        const string ENABLED = "enabled";

        public static AddonsConfig FromConfiguration(IConfiguration config) {
            var addonsSection = config.GetSection(SECTION);
            var addonsEnabled = addonsSection.GetValue(ENABLED, true);
            var addonsConfig = new AddonsConfig();
            if (addonsEnabled) {
                try {
                    addonsSection.Bind(addonsConfig);
                } catch { /* wrong configuration */
                    return null;
                }
            }
            return addonsConfig;
        }

        public string[] Paths { get; set; }
    }
}
