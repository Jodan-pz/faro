using System.Collections.Generic;
using FARO.Common.Domain;

namespace FARO.Common {
    public interface IWriterEngine {
        IEnumerable<FieldDescription> GetFields(WriterDefinition writerDefinition);
        void WriteAll(IWriter writer, IImageOutput output, IDataResourceService dataResource, IDictionary<string, object> args = null);
        WriterStreamInfo WriteAllToStream(IWriter writer, IImageOutput output, WriterStream stream, IDataResourceService dataResource, IDictionary<string, object> args = null);
    }
}
