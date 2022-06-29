using System.Net.Mail;

using FARO.Addons.Common.Extensions;
using FARO.Common;
using FARO.Common.Domain;

namespace FARO.Addons.Mail.Writers.Engine {
    public class MailWriterEngine : IWriterEngine {
        public IEnumerable<FieldDescription> GetFields(WriterDefinition writerDefinition) {
            yield break;
        }

        public void WriteAll(IWriter writer, IImageOutput output, IDataResourceService dataResource, IDictionary<string, object>? args = null) {
        }

        public WriterStreamInfo WriteAllToStream(IWriter writer, IImageOutput output, WriterStream writerStream, IDataResourceService dataResource, IDictionary<string, object>? args = null) {
            var cfg = writer.Definition.Config?.As<MailWriterConfig>();
            if (cfg is null || !(writerStream.Stream?.CanRead ?? false)) return writerStream.Info;

            (var to, var subject, var body, var cc, var bcc, var attachFileName) = GetArgsValue(writerStream, args);

            if (to is not null) {
                var message = new MailMessage(cfg.From, to, subject, body);
                if (cc is not null) message.CC.Add(cc);
                if (bcc is not null) message.Bcc.Add(bcc);

                writerStream.Stream.Seek(0, SeekOrigin.Begin);
                var attach = new Attachment(writerStream.Stream, attachFileName, writerStream.Info.ContentType);
                message.Attachments.Add(attach);

                using var smtp = new SmtpClient(cfg.Server.Host, cfg.Server.Port);
                smtp.Send(message);
            };

            writerStream.Stream.Close();
            return writerStream.Info;
        }

        private static (string? to, string? subject, string? body, string? cc, string? bcc, string? attachFileName) GetArgsValue(WriterStream writerStream, IDictionary<string, object>? args) {
            var to = args?.ContainsKey("to") ?? false ? args["to"]?.ToString() : null;
            var subject = args?.ContainsKey("subject") ?? false ? args["subject"]?.ToString() : null;
            var body = args?.ContainsKey("body") ?? false ? args["body"]?.ToString() : null;
            var cc = args?.ContainsKey("cc") ?? false ? args["cc"]?.ToString() : null;
            var bcc = args?.ContainsKey("bcc") ?? false ? args["bcc"]?.ToString() : null;
            var attachFileName = args?.ContainsKey("attachFileName") ?? false ? args["attachFileName"]?.ToString() : writerStream.Info.FileName;

            if (!Path.HasExtension(attachFileName)) attachFileName = Path.ChangeExtension(attachFileName, writerStream.Info.FileExtension);
            return (to, subject, body, cc, bcc, attachFileName);
        }
    }
}
