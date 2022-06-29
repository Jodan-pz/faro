using System;

namespace FARO.Common.Exceptions {
    public class ObjectDefinitionException : Exception {
        public IObjectDefinition Definition { get; set; }

        public ObjectDefinitionException(IObjectDefinition definition, string message)
        : base($"{definition.Name}: {message}") {
            Definition = definition;
        }
        public ObjectDefinitionException(string definitionId, string message)
        : base($"{message} - (Def. id:{definitionId})") { }
    }
}
