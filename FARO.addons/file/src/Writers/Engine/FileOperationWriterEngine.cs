using FARO.Addons.Common.Extensions;
using FARO.Common;
using FARO.Common.Domain;

using FileIO = System.IO.File;

namespace FARO.Addons.File.Writers.Engine {
    public class FileOperationWriterEngine : IWriterEngine {
        public IEnumerable<FieldDescription> GetFields(WriterDefinition writerDefinition) {
            var cfg = writerDefinition.Config?.As<FileOperationConfig>();
            var ret = new HashSet<FieldDescription>();
            if (cfg != null) {
                ret.Add(FieldDescription.Create(cfg.Input));
                ret.Add(FieldDescription.Create(cfg.Output));
            }
            return ret;
        }

        public void WriteAll(IWriter writer, IImageOutput output, IDataResourceService dataResource, IDictionary<string, object>? args = null) {
            DoOperation(writer, output);
        }

        public WriterStreamInfo WriteAllToStream(IWriter writer, IImageOutput output, WriterStream writerStream, IDataResourceService dataResource, IDictionary<string, object>? args = null) {
            DoOperation(writer, output);
            writerStream.Stream.Close();
            return writerStream.Info;
        }

        private static void DoOperation(IWriter writer, IImageOutput output) {
            var cfg = writer.Definition.Config?.As<FileOperationConfig>();
            if (cfg is null) return;
            var overwrite = cfg.Switches?.Contains("/overwrite") ?? false;
            output?.IterateRows(row => {
                var input = row.GetValueExactAs<string>(cfg.Input);
                var output = row.GetValueExactAs<string>(cfg.Output);
                if (output is not null && FileIO.Exists(input)) {
                    var outDir = Path.GetDirectoryName(output);

                    if (outDir is not null) {
                        Directory.CreateDirectory(outDir);
                    }
                    switch (cfg.Operation) {
                        case "copy":
                            FileIO.Copy(input, output, overwrite);
                            break;
                        case "move":
                            FileIO.Move(input, output, overwrite);
                            break;
                        default:
                            break;
                    }
                }
            });
        }
    }
}
