using System.Text;

namespace FARO.Addons.File.Writers {
    public class FormatStreamWriter : StreamWriter {
        readonly IFormatProvider _formatProvider;

        public FormatStreamWriter(Stream stream, Encoding encoding, IFormatProvider formatProvider) : base(stream, encoding) {
            _formatProvider = formatProvider;
        }

        public override IFormatProvider FormatProvider => _formatProvider;
    }
}