using System;
using System.Runtime.Serialization;

namespace FARO.Common.Exceptions {

    [Serializable]
    public class ObjectDefinitionException : Exception {
        public IObjectDefinition Definition { get; set; }

        public ObjectDefinitionException(IObjectDefinition definition, string message)
        : base($"{definition.Name}: {message}") {
            Definition = definition;
        }
        public ObjectDefinitionException(string definitionId, string message)
        : base($"{message} - (Def. id:{definitionId})") { }

        public ObjectDefinitionException() {
        }

        protected ObjectDefinitionException(SerializationInfo info, StreamingContext context) : base(info, context) {
        }

        public ObjectDefinitionException(string message) : base(message) {
        }

        public ObjectDefinitionException(string message, Exception innerException) : base(message, innerException) {
        }
    }
}
