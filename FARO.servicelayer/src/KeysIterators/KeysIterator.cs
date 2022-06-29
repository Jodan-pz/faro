using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using FARO.Common;
using FARO.Common.Domain;
using FARO.Common.Exceptions;

namespace FARO.Services.KeysIterators {
    public class KeysIterator : IKeysIterator {
        private readonly IKeysIteratorEngine _engine;
        private readonly IExpressionEvaluator _expressionEvaluator;
        private readonly IDataResourceService _dataResourceService;
        private readonly KeysIteratorScopedDefinition _scopedDefinition;

        public KeysIterator(KeysIteratorScopedDefinition scopedDefinition,
                            IKeysIteratorEngine engine = null,
                            IExpressionEvaluator expressionEvaluator = null,
                            IDataResourceService dataResourceService = null) {
            _scopedDefinition = scopedDefinition ?? throw new ArgumentNullException(nameof(scopedDefinition));
            _engine = engine;
            _expressionEvaluator = expressionEvaluator;
            _dataResourceService = dataResourceService;
        }

        public KeysIteratorDefinition Definition => _scopedDefinition.Definition;
        public string GetArgumentName(string name) => _scopedDefinition.GetArgumentName(name);
        public string GetOutputFieldName(string name) => _scopedDefinition.GetOutputFieldName(name);

        public void Iterate(IDictionary<string, object> args, Action<IDictionary<string, object>> keyPredicate, int? level = null) => Iterate(args, (dic) => { keyPredicate(dic); return true; }, level);
        public void Iterate(IDictionary<string, object> args, Func<IDictionary<string, object>, bool> keyPredicate, int? level = null) {
            var nested = (level ?? 1) > 1;
            var voidIteration = true;
            var emptyKeys = new Dictionary<string, object>();
            if (Definition.Fields != null) {
                foreach (var field in Definition.Fields.Select(f => GetOutputFieldName(f.Name))) emptyKeys.Add(field, null);
            }
            try {
                if (_expressionEvaluator?.EvalCondition(Definition.When, args) ?? true) {
                    var keys = _engine?.GetKeys(this, args, _dataResourceService);

                    if (nested == true && (keys == null || !keys.Any())) {
                        // create empty nested iterator result if nothing was found by the engine
                        keys = new IDictionary<string, object>[] { emptyKeys };
                    }

                    if (keys is not null) {
                        foreach (var key in keys) {
                            if (!_expressionEvaluator?.EvalCondition(Definition.Filter, key) ?? true) continue;
                            IDictionary<string, object> predicateKeys = new Dictionary<string, object>(args);
                            foreach (var keyField in key) {
                                if (predicateKeys.ContainsKey(keyField.Key)) {
                                    predicateKeys[keyField.Key] = keyField.Value;
                                } else {
                                    predicateKeys.Add(keyField);
                                }
                            }
                            voidIteration = false;
                            if (!keyPredicate(predicateKeys)) break;
                        }
                    }
                }
                if (voidIteration && nested) keyPredicate(args);
            } catch (Exception ex) {
                throw new KeysIteratorException(this, args, ex, level);
            }
        }

        public override string ToString() {
            var sb = new StringBuilder();
            sb.AppendLine($"{Definition.Id} {Definition.Name} {Definition.Description}");
            sb.AppendLine($"Data path: {_dataResourceService}");

            if (Definition.Arguments != null) {
                sb.AppendLine("--- Arguments ---");
                foreach (var arg in Definition.Arguments) sb.AppendLine($"{GetArgumentName(arg.Name)} {arg.Description} {(!arg.Optional ? '*' : ' ')}");
            }
            if (Definition.Fields != null) {
                sb.AppendLine("--- Output fields ---");
                foreach (var outField in Definition.Fields) sb.AppendLine($"{GetOutputFieldName(outField.Name)} | Value: {outField.Value} | Type: {outField.Type} | Format: {outField.Format}");
            }
            return sb.ToString();
        }
    }
}
