using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace FARO.Common {
    public static class ValidatorMessageDefaultContext {
        public const string GENERIC_ERROR_RAW_VALUES = "GENERIC_ERROR_RAW_VALUES";
    }

    public class ValidatorMessage {
        public ValidatorMessage(ImageOutputRow row, IValidator validator, string key, string message = null, string context = null) {
            Row = row;
            Validator = validator;
            Key = key;
            Message = message;
            Context = context;
        }
        public ImageOutputRow Row { get; set; }
        public IValidator Validator { get; set; }
        public string Key { get; set; }
        public string Message { get; set; }
        public string Context { get; set; }

        public bool IsGenericErrorRawValues => Context == ValidatorMessageDefaultContext.GENERIC_ERROR_RAW_VALUES;
    }

    public class ValidatorResult : IEnumerable<ValidatorMessage> {
        readonly List<ValidatorMessage> _messages = new();
        public ValidatorResult AddError(ImageOutputRow row, IValidator validator, string key, string message = null, string context = null) {
            _messages.Add(new ValidatorMessage(row, validator, key, message, context));
            return this;
        }
        public ValidatorResult Clear() { _messages.Clear(); return this; }
        public ValidatorResult AddResult(ValidatorResult result) {
            _messages.AddRange(result._messages);
            return this;
        }

        public bool Valid => !_messages.Any();
        public IEnumerator<ValidatorMessage> GetEnumerator() => _messages.GetEnumerator();
        IEnumerator IEnumerable.GetEnumerator() => _messages.GetEnumerator();

    }
}
