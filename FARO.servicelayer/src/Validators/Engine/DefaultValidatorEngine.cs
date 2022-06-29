using System;
using System.Collections.Generic;
using System.Linq;

using FARO.Common;
using FARO.Common.Domain;
using FARO.Services.Validators.Engine.Default;

using static FARO.Services.Helpers.DynamicConfigValueHelper;
using static FARO.Common.ValidatorMessageDefaultContext;
namespace FARO.Services.Validators.Engine {
    public class DefaultValidatorEngine : IValidatorEngine {
        private readonly IExpressionEvaluator _expressionEvaluator;

        public DefaultValidatorEngine(IExpressionEvaluator expressionEvaluator) {
            _expressionEvaluator = expressionEvaluator;
        }

        public ValidatorResult Validate(IValidator validator, IImageOutput imageOutput, IDataResourceService dataResource) {
            var result = new ValidatorResult();
            if (validator == null) return result;
            if ((imageOutput?.Size ?? 0) == 0) return result;
            var config = GetConfig<DefaultValidatorConfig>(validator.Definition.Config);
            if (!(config.Rules?.Any() ?? false)) return result;
            imageOutput.IterateRows(row => {
                foreach (var rule in config.Rules) {
                    var evalResult = true;
                    string expressionEvaluationError = null;
                    try {
                        evalResult = _expressionEvaluator.EvalCondition(rule.Expression, row);
                    } catch (Exception ex) {
                        /* Set result to false and 
                           set exception message to identify evaluation error!
                           (append validation errors) */
                        expressionEvaluationError = ex.Message;
                        evalResult = false;
                    }

                    if (!evalResult) {
                        var rawValuesAsStringMessage = row.Aggregate(string.Empty, (a, c) => a += $"{c.Key}={c.Value}\t").TrimEnd('\t');
                        result.AddError(row, validator, rule.Name, rawValuesAsStringMessage, GENERIC_ERROR_RAW_VALUES);

                        var validatorExpressionValues = new Dictionary<string, object>();
                        _expressionEvaluator.ForEachField(rule.Expression, (field, orig, _) => {
                            if (!validatorExpressionValues.ContainsKey(field)) {
                                validatorExpressionValues.Add(field, row.GetValue(orig));
                            }
                        });
                        var message = rule.Message;
                        _expressionEvaluator.ForEachField(rule.Message, (field, orig, _) => message = row.ContainsName(field) ? message.Replace(orig, row.GetValueExactAs<string>(field)) : message);
                        if (expressionEvaluationError != null) {
                            message = $"{rule.Name} - RULE EXPR: {rule.Expression} - {expressionEvaluationError}";
                        } else {
                            message ??= rule.Name;
                        }
                        result.AddError(row, validator, rule.Name, message, rule.Context);
                        if (config.FailFast) return false;
                    }
                }
                return true;
            });
            return result;
        }

        public IEnumerable<FieldDescription> GetFields(ValidatorDefinition validatorDefinition) {
            var config = GetConfig<DefaultValidatorConfig>(validatorDefinition.Config);
            var fields = new List<FieldDescription>();
            if (config.Rules is not null) {
                foreach (var rule in config.Rules) {
                    _expressionEvaluator.ForEachField(rule.Expression, (field, orig, args) => {
                        fields.Add(FieldDescription.Create(field, $"Expression rule {rule.Name}"));
                    });
                    _expressionEvaluator.ForEachField(rule.Message, (field, orig, args) => {
                        fields.Add(FieldDescription.Create(field, $"Message rule {rule.Name}"));
                    });
                }
            }
            return fields;
        }
    }
}
