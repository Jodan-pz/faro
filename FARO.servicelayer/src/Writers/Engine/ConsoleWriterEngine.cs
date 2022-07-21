using System.Linq;
using System.Net.Mime;
using System;
using System.Collections.Generic;
using System.IO;

using FARO.Common;
using FARO.Common.Domain;

namespace FARO.Services.Writers.Engine {
    public class ConsoleWriterEngine : IWriterEngine {
        public IEnumerable<FieldDescription> GetFields(WriterDefinition writerDefinition) => Enumerable.Empty<FieldDescription>();

        public void WriteAll(IWriter writer, IImageOutput output, IDataResourceService dataResource, IDictionary<string, object> args = null) {
            InternalWriteAll(output, Console.Out);
        }

        public WriterStreamInfo WriteAllToStream(IWriter writer, IImageOutput imageOutput, WriterStream stream, IDataResourceService dataResource, IDictionary<string, object> args = null) {
            var textWriter = new StreamWriter(stream.InnerStream);
            InternalWriteAll(imageOutput, textWriter);
            textWriter.Flush();
            return new WriterStreamInfo { ContentType = MediaTypeNames.Text.Plain, FileExtension = "txt" };
        }

        static void InternalWriteAll(IImageOutput output, TextWriter textWriter) {
            var header = true;
            output.IterateRows(row => {
                if (header) { header = false; textWriter.WriteLine(row.Aggregate(string.Empty, (a, c) => a + " " + c.Key)); }
                textWriter.WriteLine(row.Aggregate(string.Empty, (a, c) => a + " " + c.Value));
            });
        }
    }
}
