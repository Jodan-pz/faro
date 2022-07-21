using System.IO;

namespace FARO.Common {
    public class WriterStream {
        public WriterStream(Stream stream) {
            InnerStream = stream;
        }
        public Stream InnerStream { get; private set; }
        public WriterStreamInfo Info { get; set; }
    }
}
