using Microsoft.Extensions.Configuration;

namespace FARO.Common {
    public class ImagePersisterConfig {
        const string SECTION = "FARO:imagepersister";
        const string ENABLED = "enabled";
        const string CONFIG = "config";
        public static ImagePersisterConfig FromConfiguration(IConfiguration config) {
            var imagePersisterSection = config.GetSection(SECTION);
            var imagePersisterEnabled = imagePersisterSection.GetValue(ENABLED, false);
            var imagePersisterConfig = new ImagePersisterConfig();
            if (imagePersisterEnabled) {
                try {
                    imagePersisterSection.Bind(imagePersisterConfig);
                    imagePersisterConfig.Config = imagePersisterSection.GetSection(CONFIG);
                } catch { /* wrong configuration */
                    return null;
                }
            }
            return imagePersisterConfig;
        }

        public string Assembly { get; set; }
        public string Class { get; set; }
        public string RegisterMethod { get; set; }
        public bool WebApiScoped { get; set; }
        public IConfiguration Config { get; private set; }
    }
}
