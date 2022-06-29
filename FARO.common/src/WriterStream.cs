using System.IO;

namespace FARO.Common {
    public class WriterStream {
        public WriterStream(Stream stream) {
            Stream = stream;
        }
        public Stream Stream { get; private set; }
        public WriterStreamInfo Info { get; set; }
    }
}