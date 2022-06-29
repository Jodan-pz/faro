using System;
using System.Collections.Generic;
using System.Text;

using FARO.Common;
using FARO.Common.Domain;
using FARO.Common.Exceptions;

namespace FARO.Services.Writers {
    public class Writer : IWriter {
        private readonly WriterDefinition _definition;
        private readonly IWriterEngine _engine;
        private readonly IDataResourceService _dataResourceService;

        public Writer(WriterDefinition definition,
                      IWriterEngine engine,
                      IDataResourceService dataResourceService) {
            _definition = definition;
            _engine = engine;
            _dataResourceService = dataResourceService;
        }

        public WriterDefinition Definition => _definition;
        public IEnumerable<FieldDescription> GetFields() => _engine?.GetFields(Definition);
        public void Write(IImageOutput imageOutput, IDictionary<string, object> args) {
            try {
                _engine?.WriteAll(this, imageOutput, _dataResourceService, args);
            } catch (Exception ex) {
                throw new WriterException(this, args, ex);
            }
        }

        public WriterStreamInfo WriteToStream(IImageOutput imageOutput, WriterStream writerStream, IDictionary<string, object> args) {
            try {
                return _engine?.WriteAllToStream(this, imageOutput, writerStream, _dataResourceService, args);
            } catch (Exception ex) {
                throw new WriterException(this, args, ex);
            }
        }

        public override string ToString() {
            var sb = new StringBuilder();
            sb.AppendLine($"{Definition.Id} {Definition.Name} {Definition.Description}");
            sb.AppendLine($"Data path: {_dataResourceService}");
            sb.AppendLine($"Kind: {Definition.Kind}");
            sb.AppendLine("--- Arguments ---");
            foreach (var arg in Definition.Arguments) sb.AppendLine(arg.ToString());
            return sb.ToString();
        }

    }
}
