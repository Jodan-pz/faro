using System;
using System.Collections.Generic;
using System.Linq;

namespace FARO.Common.Exceptions {
    public class NullArgumentValueException : ArgumentNullException {
        public NullArgumentValueException() { }

        public NullArgumentValueException(IDecorator decorator, string paramName, ImageOutputRow imageOutputRow)
        : base($"Decorator: {decorator.Definition.Name}, argument '{paramName}'. Current row: {GetValues(imageOutputRow.ToDictionary())}") { }

        public NullArgumentValueException(IKeysIterator keysIterator, string paramName, IDictionary<string, object> args)
        : base($"Keys Iterator: {keysIterator.Definition.Name}, argument '{paramName}'. Current args: {GetValues(args)}") { }

        public NullArgumentValueException(string paramName) : base(paramName) {
        }

        public NullArgumentValueException(string paramName, string message) : base(paramName, message) {
        }

        public NullArgumentValueException(string message, Exception innerException) : base(message, innerException) {
        }

        static string GetValues(IEnumerable<KeyValuePair<string, object>> values) => values?.Aggregate(string.Empty, (a, v) => a + $" {v.Key}:{v.Value},").TrimEnd(',') ?? string.Empty;
    }
}
