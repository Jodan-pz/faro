using System.Collections.Generic;

using FARO.Common.Domain;

namespace FARO.Common {
    public interface IWriter {
        WriterDefinition Definition { get; }
        IEnumerable<FieldDescription> GetFields();
        void Write(IImageOutput imageOutput, IDictionary<string, object> args);
        WriterStreamInfo WriteToStream(IImageOutput imageOutput, WriterStream writerStream, IDictionary<string, object> args);
    }
}
