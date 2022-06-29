
using FARO.Common;
using FARO.Common.Domain;

using FileIO = System.IO.File;

namespace FARO.Addons.Stream.Writers.Engine {
    public class StreamToFileWriterEngine : IWriterEngine {
        public IEnumerable<FieldDescription> GetFields(WriterDefinition writerDefinition) {
            yield break;
        }

        public void WriteAll(IWriter writer, IImageOutput output, IDataResourceService dataResource, IDictionary<string, object>? args = null) {
        }

        public WriterStreamInfo WriteAllToStream(IWriter writer, IImageOutput output, WriterStream writerStream, IDataResourceService dataResource, IDictionary<string, object>? args = null) {
            var fileOut = args?.ContainsKey("file") ?? false ? args["file"]?.ToString() : null;
            if (fileOut is null || !(writerStream.Stream?.CanRead ?? false)) return writerStream.Info;
            if (FileIO.Exists(fileOut)) FileIO.Delete(fileOut);
            using var fileStream = new FileStream(fileOut, FileMode.Create);
            writerStream.Stream.Seek(0, SeekOrigin.Begin);
            writerStream.Stream.CopyTo(fileStream);
            writerStream.Stream.Flush();
            writerStream.Info.FileName = fileOut;
            return writerStream.Info;
        }
    }
}
