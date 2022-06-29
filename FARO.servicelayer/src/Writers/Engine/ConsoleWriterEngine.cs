using System.Net.Mime;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

using FARO.Common;
using FARO.Common.Domain;

namespace FARO.Services.Writers.Engine {
    public class ConsoleWriterEngine : IWriterEngine {
        public IEnumerable<FieldDescription> GetFields(WriterDefinition writerDefinition) => null;

        public void WriteAll(IWriter writer, IImageOutput output, IDataResourceService dataResource, IDictionary<string, object> args) {
            InternalWriteAll(output, Console.Out);
        }

        public WriterStreamInfo WriteAllToStream(IWriter writer, IImageOutput output, WriterStream writerStream, IDataResourceService dataResource, IDictionary<string, object> args) {
            var textWriter = new StreamWriter(writerStream.Stream);
            InternalWriteAll(output, textWriter);
            textWriter.Flush();
            return new WriterStreamInfo { ContentType = MediaTypeNames.Text.Plain, FileExtension = "txt" };
        }

        static void InternalWriteAll(IImageOutput output, TextWriter textWriter) {
            var header = true;
            output.IterateRows(row => {
                if (header) { header = false; textWriter.WriteLine(row.Aggregate(string.Empty, (a, c) => a += " " + c.Key)); }
                textWriter.WriteLine(row.Aggregate(string.Empty, (a, c) => a += " " + c.Value));
            });
        }
    }
}
