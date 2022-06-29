using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using FARO.Common;
using FARO.Common.Domain;
using FARO.Services.Aggregators.Engine.Default;
using static FARO.Services.Helpers.DynamicConfigValueHelper;

namespace FARO.Services.Aggregators.Engine {
    public class DefaultAggregatorEngine : IAggregatorEngine {
        private readonly IExpressionEvaluator _expressionEvaluator;

        public DefaultAggregatorEngine(IExpressionEvaluator expressionEvaluator) {
            _expressionEvaluator = expressionEvaluator;
        }

        public IImageOutput Aggregate(IAggregator aggregator, IImageOutput imageOutput, IDataResourceService dataResource) {
            if (aggregator == null) return imageOutput;

            if ((imageOutput?.Size ?? 0) == 0) return imageOutput;

            var config = GetConfig<DefaultAggregatorConfig>(aggregator.Definition.Config);
            var distinctFields = config.Fields.Where(f => f.Function == DefaultAggregatorFunction.Distinct);
            var functionFields = config.Fields.Except(distinctFields);
            var aggregated = new Dictionary<string, Dictionary<string, object>>();
            imageOutput.IterateRows(row => {
                if (_expressionEvaluator.EvalCondition(config.Filter, row)) {
                    (var hash, var aggFields) = CreateAggregatedRowHash(distinctFields, row);
                    if (!aggregated.ContainsKey(hash)) aggregated.Add(hash, aggFields);
                    // apply basic aggregation functions
                    var aggregatedRow = aggregated[hash];
                    foreach (var field in functionFields) {
                        AggregateField(aggregatedRow, field, row);
                    }
                }
            });
            return new ImageOutput(aggregated.Values);
        }

        public IEnumerable<FieldDescription> GetFields(AggregatorDefinition aggregatorDefinition) {
            var config = GetConfig<DefaultAggregatorConfig>(aggregatorDefinition.Config);
            var ret = new List<FieldDescription>();
            if (config.Fields != null) {
                ret.AddRange(config.Fields.Select(f => f.Name)
                                          .Distinct()
                                          .Select(FieldDescription.Create));
            }
            _expressionEvaluator.ForEachField(config.Filter, (field, orig, args) => {
                ret.Add(FieldDescription.Create(field, $"Filter: {config.Filter}"));
            });
            return ret;
        }

        public IEnumerable<string> GetAggregatedFields(AggregatorDefinition aggregatorDefinition) {
            var config = GetConfig<DefaultAggregatorConfig>(aggregatorDefinition.Config);
            return config.Fields?.Select(f => f.Function == DefaultAggregatorFunction.Distinct
                ? f.Name
                : $"{f.Function.ToString().ToUpper()}_{f.Name}"
            );
        }

        static void AggregateField(Dictionary<string, dynamic> aggregatedRow, DefaultAggregatorConfigField field, ImageOutputRow outputRow) {
            var funcFieldName = $"{field.Function.ToString().ToUpper()}_{field.Name}";
            if (!aggregatedRow.ContainsKey(funcFieldName)) aggregatedRow.Add(funcFieldName, null);

            var dynaValue = outputRow.GetDynamicValue(field.Name);

            switch (field.Function) {
                case DefaultAggregatorFunction.Count: {
                        aggregatedRow[funcFieldName] = (aggregatedRow[funcFieldName] ?? 0) + 1;
                        break;
                    }
                case DefaultAggregatorFunction.Min: {
                        if (aggregatedRow[funcFieldName] == null || dynaValue < aggregatedRow[funcFieldName])
                            aggregatedRow[funcFieldName] = dynaValue;
                        break;
                    }
                case DefaultAggregatorFunction.Max: {
                        if (aggregatedRow[funcFieldName] == null || dynaValue > aggregatedRow[funcFieldName])
                            aggregatedRow[funcFieldName] = dynaValue;
                        break;
                    }
                case DefaultAggregatorFunction.Sum: {
                        aggregatedRow[funcFieldName] = (aggregatedRow[funcFieldName] ?? 0) + Convert.ToDecimal(dynaValue);
                        break;
                    }
            }
        }

        static (string hash, Dictionary<string, object> aggFields) CreateAggregatedRowHash(IEnumerable<DefaultAggregatorConfigField> distinctFields, ImageOutputRow row) {
            var hash = new StringBuilder();
            var aggFields = new Dictionary<string, object>();
            foreach (var field in distinctFields) {
                var fieldValue = row.GetValueExact(field.Name);
                hash.Append($"{field}={(fieldValue == null ? "null" : fieldValue.GetHashCode().ToString())}_");
                aggFields.Add(field.Name, fieldValue);
            }
            return (hash.ToString(), aggFields);
        }
    }
}
