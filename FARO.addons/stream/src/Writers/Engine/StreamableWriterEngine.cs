using System.Net.Mime;

using FARO.Addons.Common.Extensions;
using FARO.Common;
using FARO.Common.Domain;

using static FARO.Addons.Common.Config.WriterMapArgs;

namespace FARO.Addons.Stream.Writers.Engine {
    public class StreamableWriterEngine : IWriterEngine {
        private readonly IEngineFactory _engineFactory;
        private readonly IDefinitionDataService _definitionDataService;

        public StreamableWriterEngine(IEngineFactory engineFactory, IDefinitionDataService definitionDataService) {
            _engineFactory = engineFactory ?? throw new ArgumentNullException(nameof(engineFactory));
            _definitionDataService = definitionDataService ?? throw new ArgumentNullException(nameof(definitionDataService));
        }

        public IEnumerable<FieldDescription> GetFields(WriterDefinition writerDefinition) {
            var ret = new HashSet<FieldDescription>();
            var cfg = writerDefinition.Config?.As<StreamableWriterConfig>();
            if (cfg is null) return ret;
            var rootWriterDef = _definitionDataService.GetWriter(cfg.Chain.Root.Id);
            var nextWriterDef = _definitionDataService.GetWriter(cfg.Chain.Next.Id);
            var rootWriter = _engineFactory.CreateWriter(rootWriterDef);
            var nextWriter = _engineFactory.CreateWriter(nextWriterDef);
            var rootWriterFields = rootWriter.GetFields();
            var nextWriterFields = nextWriter.GetFields();
            if (rootWriterFields is not null) foreach (var field in rootWriterFields) ret.Add(field);
            if (nextWriterFields is not null) foreach (var field in nextWriterFields) ret.Add(field);
            return ret;
        }

        public void WriteAll(IWriter writer, IImageOutput output, IDataResourceService dataResource, IDictionary<string, object>? args = null) {
            using var outStream = new MemoryStream();
            var ws = new WriterStream(outStream)
            {
                Info = new WriterStreamInfo { ContentType = MediaTypeNames.Text.Plain, FileExtension = "txt" }
            };
            WriteAllToStream(writer, output, ws, dataResource, args);
        }

        public WriterStreamInfo WriteAllToStream(IWriter writer, IImageOutput output, WriterStream writerStream, IDataResourceService dataResource, IDictionary<string, object>? args = null) {
            var cfg = writer.Definition.Config?.As<StreamableWriterConfig>();
            if (cfg is null || !(writerStream.Stream?.CanWrite ?? false)) return writerStream.Info;
            var rootDef = _definitionDataService.GetWriter(cfg.Chain.Root.Id);
            var rootMappedArgs = MapArgs(cfg.Chain.Root.Args, args);
            var rootWriter = _engineFactory.CreateWriter(rootDef);
            var nextDef = _definitionDataService.GetWriter(cfg.Chain.Next.Id);
            var nextMappedArgs = MapArgs(cfg.Chain.Next.Args, args);
            var nextWriter = _engineFactory.CreateWriter(nextDef);
            var rootInfo = rootWriter.WriteToStream(output, writerStream, rootMappedArgs);
            writerStream.Info = rootInfo; // update stream info before chaining...
            return nextWriter.WriteToStream(output, writerStream, nextMappedArgs);
        }
    }
}