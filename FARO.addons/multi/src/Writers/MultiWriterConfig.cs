using FARO.Addons.Common.Config;
namespace FARO.Addons.Multi.Writers.Engine {

    class MultiWriterConfig {
        public bool StreamZip { get; set; }
        public WriterConfig[]? Writers { get; set; }
    }
}