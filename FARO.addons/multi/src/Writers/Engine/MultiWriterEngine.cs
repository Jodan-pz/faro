using System.IO.Compression;
using System.Net.Mime;

using FARO.Addons.Common.Extensions;
using FARO.Common;
using FARO.Common.Domain;

using static FARO.Addons.Common.Config.WriterMapArgs;

namespace FARO.Addons.Multi.Writers.Engine {

    public class MultiWriterEngine : IWriterEngine {
        private readonly IEngineFactory _engineFactory;
        private readonly IDefinitionDataService _definitionDataService;

        public MultiWriterEngine(IEngineFactory engineFactory, IDefinitionDataService definitionDataService) {
            _engineFactory = engineFactory ?? throw new ArgumentNullException(nameof(engineFactory));
            _definitionDataService = definitionDataService ?? throw new ArgumentNullException(nameof(definitionDataService));
        }

        public IEnumerable<FieldDescription> GetFields(WriterDefinition writerDefinition) {
            var ret = new HashSet<FieldDescription>();
            var cfg = writerDefinition.Config?.As<MultiWriterConfig>();
            if (cfg?.Writers is null) return ret;
            foreach (var writerMap in cfg.Writers) {
                var writerDef = _definitionDataService.GetWriter(writerMap.Id);
                var writer = _engineFactory.CreateWriter(writerDef);
                var fields = writer.GetFields();
                if (fields is null) continue;
                foreach (var field in fields)
                    ret.Add(field);
            }
            return ret;
        }

        public void WriteAll(IWriter writer, IImageOutput output, IDataResourceService dataResource, IDictionary<string, object>? args = null) {
            var cfg = writer.Definition.Config?.As<MultiWriterConfig>();
            if (cfg?.Writers is null) return;
            List<(IWriter Writer, IDictionary<string, object> Args)> items = new();
            foreach (var writerMap in cfg.Writers) {
                var writerDef = _definitionDataService.GetWriter(writerMap.Id);
                var mappedArgs = MapArgs(writerMap.Args, args);
                items.Add((_engineFactory.CreateWriter(writerDef), mappedArgs));
            }
            Parallel.ForEach(items, item => {
                item.Writer.Write(output, item.Args);
            });
        }

        public WriterStreamInfo WriteAllToStream(IWriter writer, IImageOutput output, WriterStream writerStream, IDataResourceService dataResource, IDictionary<string, object>? args = null) {
            var cfg = writer.Definition.Config?.As<MultiWriterConfig>();
            if (cfg?.Writers is null || !(writerStream.Stream?.CanWrite ?? false)) return writerStream.Info;
            using var zipArchive = cfg.StreamZip ? new ZipArchive(writerStream.Stream, ZipArchiveMode.Create, true) : null;

            foreach (var writerMap in cfg.Writers) {
                var writerDef = _definitionDataService.GetWriter(writerMap.Id);
                var writerInstance = _engineFactory.CreateWriter(writerDef);
                var mappedArgs = MapArgs(writerMap.Args, args);
                if (zipArchive is not null) {
                    writerStream.Info = AddZipEntry(zipArchive, writerDef.Name, output, writerInstance, mappedArgs);
                } else {
                    writerStream.Info = writerInstance.WriteToStream(output, writerStream, mappedArgs);
                }
            }

            if (cfg.StreamZip) {
                return new WriterStreamInfo
                {
                    FileName = writer.Definition.Name,
                    ContentType = MediaTypeNames.Application.Zip,
                    FileExtension = "zip"
                };
            }
            return writerStream.Info;
        }

        private static WriterStreamInfo AddZipEntry(ZipArchive zipArchive,
                                                    string writerDefName,
                                                    IImageOutput output,
                                                    IWriter writerInstance,
                                                    IDictionary<string, object> mappedArgs) {
            using var ms = new MemoryStream();
            var ret = writerInstance.WriteToStream(output, new WriterStream(ms), mappedArgs);
            ms.Flush();
            var entryName = ret.FileName ?? writerDefName;
            if (!$".{ret.FileExtension}".Equals(Path.GetExtension(entryName), StringComparison.OrdinalIgnoreCase)) {
                entryName = Path.ChangeExtension(entryName, ret.FileExtension);
            }
            var ze = zipArchive.CreateEntry($"{entryName}", CompressionLevel.Optimal);
            using var zipStream = ze.Open();
            ms.Seek(0, SeekOrigin.Begin);
            ms.CopyTo(zipStream);
            ms.Close();
            return ret;
        }
    }
}