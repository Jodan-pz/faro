using FARO.Addons.Common.Config;

namespace FARO.Addons.Stream.Writers {

    struct ChainConfig {
        public WriterConfig Root { get; set; }
        public WriterConfig Next { get; set; }
    }
}