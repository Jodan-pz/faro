using System;
using System.Collections.Generic;
using System.Linq;

using FARO.Common;
using FARO.Common.Domain;
using FARO.Common.Helpers;

namespace FARO.Services {
    /// <summary>
    ///    ---------------------------------------------
    ///         FlowItem Sanity Check Validator
    ///    ---------------------------------------------

    ///            (1) IMAGE VALIDATION
    ///    ---------------------------------------------
    ///    0 - Check Image existence, if missing add error
    ///    ** For each Keys Iterator:
    ///    1 - Check existence, if missing add error
    ///    2 - Compose unique list of keys based upon arguments and output fields
    ///    ---------------------------------------------------------------
    ///    ** Compose a unique list of all layered fields
    ///    0 - Check existence of all keys used in fields, otherwise add error(s)
    ///    ** For each Sourced Decorator field:
    ///    1 - Check existence, if missing add error
    ///    2 - Validate decorator engine arguments using all fields available (keys and layers)
    ///    3 - Validate output fields mapping against decorator usage
    ///    ** For all decorators values
    ///    1 - Validate field references {xxx}
    ///    ---------------------------------------------

    ///            (2) AGGREGATOR VALIDATION
    ///    ---------------------------------------------
    ///    0 - Check aggregator existence, if missing add error
    ///    1 - Check existence of each field in all image fields (keys and layers)
    ///    2 - Compose a list of output fields (engine)
    ///    ---------------------------------------------

    ///            (3) WRITER VALIDATION
    ///    ---------------------------------------------
    ///    0 - Check writer existence, if missing add error
    ///    1 - Check existence of each field usage (engine) in aggregator fields or if missing, all image fields (keys and layers)
    /// </summary>
    public class IntegrityCheckService : IIntegrityCheckService {
        readonly IEngineFactory _engineFactory;
        readonly IDefinitionDataService _definitionDataService;
        readonly IExpressionEvaluator _expressionEvaluator;

        public IntegrityCheckService(IEngineFactory engineFactory,
                                     IDefinitionDataService definitionDataService,
                                     IExpressionEvaluator expressionEvaluator) {
            _engineFactory = engineFactory ?? throw new ArgumentNullException(nameof(engineFactory));
            _definitionDataService = definitionDataService ?? throw new ArgumentNullException(nameof(definitionDataService));
            _expressionEvaluator = expressionEvaluator ?? throw new ArgumentNullException(nameof(expressionEvaluator));
        }

        public CheckResultCollection CheckFlowItem(string flowItemId) {
            var ret = new CheckResultCollection();
            ret.AddInfo(CheckArea.Flow, "Resolving", flowItemId);
            var flow = _definitionDataService.GetFlowItem(flowItemId);
            if (flow == null) {
                ret.AddError(CheckArea.Flow, "Not found", flowItemId);
            }
            ret.AddInfo(CheckArea.Flow, "Resolved", flow.Name);
            return ret.AddAll(CheckFlowItem(flow));
        }

        public CheckResultCollection CheckImage(string imageId) => CheckImage(imageId, out _);

        public (CheckerDelegate, CheckerDelegate) CreateChecker(string imageId, string aggregatorId = null) {
            CheckImage(imageId, out var of);
            HashSet<string> af = null;
            if (aggregatorId is not null) CheckAggregator(aggregatorId, of, out af);
            return ((string validatorId) => CheckValidator(validatorId, of),
                    (string writerId) => CheckWriter(writerId, af ?? of));
        }

        CheckResultCollection CheckImage(string imageId, out HashSet<string> outputFields) {
            outputFields = new HashSet<string>();
            var ret = new CheckResultCollection();
            ret.AddInfo(CheckArea.Image, "Resolving", imageId);
            var image = _definitionDataService.GetImage(imageId);
            if (image == null) {
                ret.AddError(CheckArea.Image, "Not found", imageId);
                return ret;
            }
            ret.AddInfo(CheckArea.Image, "Resolved", image.Name);
            var keyFields = new HashSet<string>();
            var firstIterator = true;
            if (image.KeysIterators != null) {
                foreach (var ki in image.KeysIterators) {
                    ret.AddInfo(CheckArea.KeysIterator, "Resolving", ki.KeyId);
                    var kiDef = _definitionDataService.GetKeysIterator(ki.KeyId);
                    if (kiDef == null) {
                        ret.AddError(CheckArea.KeysIterator, "Not found", ki.KeyId);
                        continue;
                    }
                    ret.AddInfo(CheckArea.KeysIterator, "Resolved", kiDef.Name);
                    var keysIterator = _engineFactory.CreateKeysIterator(KeysIteratorScopedDefinition.Create(kiDef, ki));
                    var dicKeysIteratorArgumentNames = new List<string>();
                    if (kiDef.Arguments != null) {
                        foreach (var kiDefArgName in kiDef.Arguments.Select(a => a.Name)) {
                            var kiArgName = keysIterator.GetArgumentName(kiDefArgName);

                            ret.AddInfo(CheckArea.KeysIterator, $"Argument: {kiArgName}", kiDef.Name);
                            // check resolved argument value
                            if (!firstIterator && keyFields.Any() && !keyFields.Contains(kiArgName)) ret.AddWarning(CheckArea.KeysIterator, "Possibly missing argument value. Should be externally passed? Should be found on previous iteration context?", kiArgName);
                            if (dicKeysIteratorArgumentNames.Contains(kiArgName)) ret.AddWarning(CheckArea.KeysIterator, "Argument already exists! Check definition.", kiArgName);
                            keyFields.Add(kiArgName);
                            outputFields.Add(PrefixHelper.KeyName(kiArgName));
                            dicKeysIteratorArgumentNames.Add(kiArgName);
                        }
                    }
                    if (kiDef.Fields != null) {
                        foreach (var kiDefOutFieldName in kiDef.Fields) {
                            var kiOutField = keysIterator.GetOutputFieldName(kiDefOutFieldName.Name);
                            ret.AddInfo(CheckArea.KeysIterator, $"Output field: {kiOutField}", kiDef.Name);
                            if (keyFields.Contains(kiOutField)) ret.AddWarning(CheckArea.KeysIterator, "Output field already exists! Check definition.", kiOutField);
                            keyFields.Add(kiOutField);
                            outputFields.Add(PrefixHelper.KeyName(kiOutField));
                        }
                    }
                    firstIterator = false;
                    _expressionEvaluator.ForEachField(kiDef.When, (field, orig, args) => {
                        if (!keyFields.Contains(field)) ret.AddError(CheckArea.KeysIterator, $"Key field: {field} used in when expression missing!", kiDef.When);
                    });
                    _expressionEvaluator.ForEachField(kiDef.Filter, (field, orig, args) => {
                        if (!keyFields.Contains(field)) ret.AddError(CheckArea.KeysIterator, $"Key field: {field} used in filter expression missing!", kiDef.Filter);
                    });

                }
            }

            var imageFields = new HashSet<string>();
            var decorators = new List<(string id, string map, ArgumentValue[] values)>();
            var decoratorDefinitions = new Dictionary<string, DecoratorDefinition>();

            if (image.Layers != null) {
                ret.AddInfo(CheckArea.Image, "Evaluating layers", image.Name);
                var layerFieldNames = new HashSet<string>();
                foreach (var layer in image.Layers) {
                    layerFieldNames.Clear();
                    foreach (var item in layer.Items) {
                        var fieldName = item.Field;
                        var fieldConfig = item.Config;
                        if (fieldConfig != null && !fieldConfig.GetType().IsPrimitive) {
                            if (layerFieldNames.Contains(fieldName)) ret.AddWarning(CheckArea.Decorator, $"Field name already defined on same layer '{layer.Name}'!", fieldName);
                            layerFieldNames.Add(fieldName);

                            if (fieldConfig is string) {
                                // check all keys fields used.
                                if (PrefixHelper.IsKeyName(fieldConfig, out string keyName)) {
                                    if (!keyFields.Contains(keyName)) ret.AddError(CheckArea.Decorator, $"Key '{keyName}' not found", fieldName);
                                } // grab inline decorator
                                else if (PrefixHelper.IsDecoratorName(fieldConfig, out string decoratorName)) {
                                    var decName = decoratorName.Split('.');
                                    var decorator = (id: decName.First(),
                                                    map: decName.Length > 1 ? decName.Last() : null,
                                                    values: Array.Empty<ArgumentValue>()
                                                    );
                                    decorators.Add(decorator);
                                    ret.AddInfo(CheckArea.Decorator, $"Definition found", decoratorName);
                                    ret.AddInfo(CheckArea.Decorator, $"Field: {fieldName}", $"Layer '{layer.Name}'");
                                    ret.AddAll(CheckDecorator(decoratorDefinitions, decorator, keyFields, imageFields));
                                } else if (PrefixHelper.IsExpressionValue(fieldConfig, out string expressionValue)) {
                                    // eval expression context for fields
                                    _expressionEvaluator.ForEachField(expressionValue, (field, orig, args) => {
                                        var allFields = (ISet<string>)args[0];
                                        if (PrefixHelper.IsKeyName(field, out var key)) {
                                            if (!keyFields.Contains(key)) ret.AddError(CheckArea.Decorator, $"Key field: {key} used in expression missing!", expressionValue);
                                        } else {
                                            if (!allFields.Contains(field)) ret.AddError(CheckArea.Decorator, $"Image field: {field} used in expression missing!", expressionValue);
                                        }
                                    }, outputFields);
                                }
                            } else {
                                var decoratorName = fieldConfig.decorator.Value;
                                Dictionary<string, string> decoratorArgs = fieldConfig.args?.ToObject<Dictionary<string, string>>();
                                string[] decName = decoratorName.Split('.');
                                var decorator = (id: decName.First(),
                                                 map: decName.Length > 1 ? decName.Last() : null,
                                                 values: decoratorArgs?.Select(kv => new ArgumentValue
                                                 {
                                                     Name = kv.Key,
                                                     Value = kv.Value
                                                 }).ToArray()
                                                 );
                                decorators.Add(decorator);
                                // grab standard decorator
                                ret.AddInfo(CheckArea.Decorator, "Definition found", decoratorName);
                                ret.AddInfo(CheckArea.Decorator, $"Field: {fieldName}", $"Layer '{layer.Name}'");
                                ret.AddAll(CheckDecorator(decoratorDefinitions, decorator, keyFields, imageFields));
                            }
                        }
                        imageFields.Add(fieldName);
                        outputFields.Add(fieldName);
                    }

                }
            }
            if (image.Filter != null) {
                _expressionEvaluator.ForEachField(image.Filter, (field, orig, args) => {
                    var allFields = (ISet<string>)args[0];
                    if (!allFields.Contains(field)) {
                        ret.AddError(CheckArea.Image, $"Field: {field} used in filter expression missing!", image.Filter);
                    }
                }, outputFields);
            }
            return ret;
        }

        CheckResultCollection CheckFlowItem(FlowItemDefinition flow) {
            var ret = new CheckResultCollection();
            if (flow.ImageId != null) {
                ret.AddAll(CheckImage(flow.ImageId, out var outputFields));

                if (flow.ValidatorId != null) {
                    ret.AddAll(CheckValidator(flow.ValidatorId, outputFields));
                }
                if (flow.AggregatorId != null) {
                    ret.AddAll(CheckAggregator(flow.AggregatorId, outputFields, out var aggregatedFields));
                    outputFields = aggregatedFields ?? outputFields;
                }
                if (flow.WriterId != null) {
                    ret.AddAll(CheckWriter(flow.WriterId, outputFields));
                }
            }
            return ret;
        }

        CheckResultCollection CheckWriter(string writerId, HashSet<string> outputFields) {
            var ret = new CheckResultCollection();
            ret.AddInfo(CheckArea.Writer, "Resolving", writerId);
            var writerDef = _definitionDataService.GetWriter(writerId);
            if (writerDef == null) {
                ret.AddError(CheckArea.Writer, "Not found", writerId);
                return ret;
            }
            ret.AddInfo(CheckArea.Writer, "Resolved", writerDef.Name);
            IWriter writer = null;
            try {
                ret.AddInfo(CheckArea.Writer, $"Creating engine: {writerDef.Kind}", writerDef.Name);
                writer = _engineFactory.CreateWriter(writerDef);
                ret.AddInfo(CheckArea.Writer, $"{writerDef.Kind}, engine created", writerDef.Name);
            } catch (Exception ex) {
                ret.AddError(CheckArea.Writer, $"Exception: {ex.Message}", writerDef.Kind);
            }
            if (writerDef == null) {
                ret.AddError(CheckArea.Writer, $"Writer engine '{writerDef.Kind}' cannot be created.", writerDef.Name);
            } else {
                var fields = writer.GetFields();
                if (fields != null) {
                    foreach (var writerField in fields) {
                        ret.AddInfo(CheckArea.Writer, $"Field: {writerField.Name}", writerDef.Name);
                        if (!outputFields?.Contains(writerField.Name) ?? false) {
                            ret.AddError(CheckArea.Writer,
                                $"Possibly wrong writer definition. '{writerField.Name}' will not be resolved.",
                                writerField.Description ?? writerField.Name);
                        } else {
                            ret.AddInfo(CheckArea.Writer, $"Field found: {writerField}", writerDef.Name);
                        }
                    }
                }
            }
            return ret;
        }

        CheckResultCollection CheckValidator(string validatorId, HashSet<string> outputFields) {
            var ret = new CheckResultCollection();
            ret.AddInfo(CheckArea.Validator, "Resolving", validatorId);
            var validatorDef = _definitionDataService.GetValidator(validatorId);
            if (validatorDef == null) {
                ret.AddError(CheckArea.Validator, "Not found", validatorId);
                return ret;
            }
            ret.AddInfo(CheckArea.Validator, "Resolved", validatorDef.Name);
            IValidator validator = null;
            try {
                ret.AddInfo(CheckArea.Validator, $"Creating engine: {validatorDef.Kind}", validatorDef.Name);
                validator = _engineFactory.CreateValidator(validatorDef);
                ret.AddInfo(CheckArea.Validator, $"{validatorDef.Kind}, engine created", validatorDef.Name);
            } catch (Exception ex) {
                ret.AddError(CheckArea.Validator, $"Exception: {ex.Message}", validatorDef.Kind);
            }
            if (validator == null) {
                ret.AddError(CheckArea.Validator, $"Validator engine '{validatorDef.Kind}' cannot be created.", validatorDef.Name);
            } else {
                var fields = validator.GetFields();
                if (fields != null) {
                    foreach (var validatorField in fields) {
                        ret.AddInfo(CheckArea.Validator, $"Field: {validatorField.Name}", validatorDef.Name);
                        if (!outputFields?.Contains(validatorField.Name) ?? false) {
                            ret.AddError(CheckArea.Validator,
                                $"Possibly wrong validator definition. '{validatorField.Name}' will not be resolved.",
                                validatorField.Description ?? validatorField.Name);
                        } else {
                            ret.AddInfo(CheckArea.Validator, $"Field found: {validatorField.Name}", validatorDef.Name);
                        }
                    }
                }
            }
            return ret;
        }

        CheckResultCollection CheckAggregator(string aggregatorId, HashSet<string> outputFields, out HashSet<string> aggregatedFields) {
            aggregatedFields = null;
            var ret = new CheckResultCollection();
            ret.AddInfo(CheckArea.Aggregator, "Resolving", aggregatorId);
            var aggregatorDef = _definitionDataService.GetAggregator(aggregatorId);
            if (aggregatorDef == null) {
                ret.AddError(CheckArea.Aggregator, "Not found", aggregatorId);
                return ret;
            }
            ret.AddInfo(CheckArea.Aggregator, "Resolved", aggregatorDef.Name);
            IAggregator aggregator = null;
            try {
                ret.AddInfo(CheckArea.Aggregator, $"Creating engine: {aggregatorDef.Kind}", aggregatorDef.Name);
                aggregator = _engineFactory.CreateAggregator(aggregatorDef);
                ret.AddInfo(CheckArea.Aggregator, $"{aggregatorDef.Kind}, engine created", aggregatorDef.Name);
            } catch (Exception ex) {
                ret.AddError(CheckArea.Aggregator, $"Exception: {ex.Message}", aggregatorDef.Kind);
            }
            if (aggregator == null) {
                ret.AddError(CheckArea.Aggregator, $"Aggregator engine '{aggregatorDef.Kind}' cannot be created.", aggregatorDef.Name);
            } else {
                var fields = aggregator.GetFields();
                var outAggrFields = aggregator.GetAggregatedFields();
                if (outAggrFields != null) aggregatedFields = new HashSet<string>(outAggrFields);
                if (fields != null) {
                    foreach (var aggregatorField in fields) {
                        ret.AddInfo(CheckArea.Aggregator, $"Field: {aggregatorField}", aggregatorDef.Name);
                        if (!outputFields.Contains(aggregatorField.Name)) {
                            ret.AddError(CheckArea.Aggregator,
                                $"Possibly wrong aggregator definition. Field '{aggregatorField}' will not be resolved.",
                                aggregatorField.Description ?? aggregatorField.Name);
                        } else {
                            ret.AddInfo(CheckArea.Aggregator, $"Field found: {aggregatorField}", aggregatorDef.Name);
                        }
                    }
                }
            }
            return ret;
        }

        CheckResultCollection CheckDecorator(Dictionary<string, DecoratorDefinition> decoratorDefinitions, (string id, string map, ArgumentValue[] values) decorator, HashSet<string> keyFields, HashSet<string> imageFields) {
            var ret = new CheckResultCollection();
            var hasValues = decorator.values?.Any() ?? false;
            var values = hasValues ? $" - Values : {decorator.values.Aggregate("", (a, v) => a += $"({v.Name}={v.Value})")}" : "";
            ret.AddInfo(CheckArea.Decorator, $"Map: {decorator.map} {values}", decorator.id);
            if (!decoratorDefinitions.ContainsKey(decorator.id)) {
                decoratorDefinitions.Add(decorator.id, _definitionDataService.GetDecorator(decorator.id));
            }
            var decDef = decoratorDefinitions[decorator.id];
            if (decDef == null) {
                ret.AddError(CheckArea.Decorator, "Not found", decorator.id);
                return ret;
            }

            if (decDef.Source != null) {
                try { _engineFactory.CreateDecorator(decDef); } catch {
                    ret.AddError(CheckArea.Decorator, $"Decorator engine '{decDef.Source?.Type}' cannot be created.", decDef.Name);
                }
            }

            ret.AddInfo(CheckArea.Decorator, "Definition resolution", decDef.Name);

            // check unnecessary decorator arguments
            if (decorator.values != null) {
                foreach (var decArgInstance in decorator.values) {
                    if (decDef.Arguments.SingleOrDefault(a => a.Name == decArgInstance.Name) == null) {
                        ret.AddWarning(CheckArea.Decorator, $"Possibly wrong layer decorator definition. Argument '{decArgInstance.Name}' of value: '{decArgInstance.Value}' is not defined and will not be used.", decArgInstance.Name);
                    }
                }
            }
            if (decDef.Arguments?.Any() ?? false) {
                foreach (var decArg in decDef.Arguments) {
                    var argValue = decorator.values?.SingleOrDefault(v => v.Name == decArg.Name);
                    if (argValue == null) {
                        if (!decArg.Optional && !imageFields.Contains(decArg.Name) && !keyFields.Contains(decArg.Name)) {
                            ret.AddError(CheckArea.Decorator, $"Possibly wrong layer decorator definition. Argument '{decArg.Name}' will not be resolved.", decDef.Name);
                        }
                    } else {
                        if (IsRefField(argValue.Value, out var refField)) {
                            if (PrefixHelper.IsKeyName(refField, out var keyName)) {
                                if (!keyFields.Contains(keyName)) ret.AddError(CheckArea.Decorator, $"Possibly wrong layer decorator definition. Argument '{decArg.Name}' of KEY value '{refField}' will not be resolved.", decDef.Name);
                            } else if (!keyFields.Contains(keyName) && !imageFields.Contains(refField)) {
                                ret.AddError(CheckArea.Decorator, $"Possibly wrong layer decorator definition. Argument '{decArg.Name}' of value '{refField}' will not be resolved.", decDef.Name);
                            }
                        }
                    }
                }
                _expressionEvaluator.ForEachField(decDef.When, (field, orig, args) => {
                    if (decDef.Arguments.SingleOrDefault(f => f.Name == field) == null) ret.AddError(CheckArea.Decorator, $"Argument field: {field} used in when expression missing!", decDef.When);
                });
            }
            // check decorator mapping
            if (decorator.map == null && decDef.Fields?.Count() > 1) {
                ret.AddError(CheckArea.Decorator, "Multiple result fields. Cannot auto map to single result!", decDef.Name);
            }
            if (decorator.map != null && decDef.Fields?.SingleOrDefault(f => f.Name == decorator.map) == null) {
                ret.AddError(CheckArea.Decorator, $"Mapping not found for field '{decorator.map}'", decDef.Name);
            }
            return ret;
        }

        static bool IsRefField(object fieldValue, out string refField) {
            refField = fieldValue?.ToString();
            if (refField.StartsWith("{", StringComparison.OrdinalIgnoreCase) && refField.EndsWith("}", StringComparison.OrdinalIgnoreCase)) {
                refField = refField[1..^1];
                return true;
            }
            return false;
        }

    }
}
