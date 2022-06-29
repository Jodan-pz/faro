using System;
using System.Collections.Generic;

namespace FARO.Common.Domain {
    public sealed class KeysIteratorScopedDefinition {
        readonly KeysIteratorDefinition _definition;
        readonly IDictionary<string, string> _argumentSelectors = null;
        readonly IDictionary<string, string> _outputFieldNames = null;

        KeysIteratorScopedDefinition(KeysIteratorDefinition definition,
                                     IDictionary<string, string> argumentSelectors = null,
                                     IDictionary<string, string> outputFieldNames = null) {
            _definition = definition ?? throw new ArgumentNullException(nameof(definition));
            _argumentSelectors = argumentSelectors;
            _outputFieldNames = outputFieldNames;
        }

        public static KeysIteratorScopedDefinition Create(KeysIteratorDefinition kiDef,
                                                          ImageKeysIteratorsDefinition imageKeysIteratorsDefinition) {
            if (kiDef.Id != imageKeysIteratorsDefinition.KeyId) return null;
            return Create(kiDef, imageKeysIteratorsDefinition.Arguments, imageKeysIteratorsDefinition.Fields);
        }

        public static KeysIteratorScopedDefinition Create(KeysIteratorDefinition kiDef,
                                                          Dictionary<string, string> arguments = null,
                                                          Dictionary<string, string> fields = null) {
            if (kiDef == null) throw new ArgumentNullException(nameof(kiDef));
            return new KeysIteratorScopedDefinition(kiDef, arguments, fields);
        }

        public KeysIteratorDefinition Definition => _definition;
        public string GetArgumentName(string name) => _argumentSelectors?.ContainsKey(name) ?? false ? _argumentSelectors[name] : name;
        public string GetOutputFieldName(string name) => _outputFieldNames?.ContainsKey(name) ?? false ? _outputFieldNames[name] : name;
    }
}