using System;
using System.Linq;

using FARO.Common;

namespace FARO.Services.ImagePersister {
    internal static class FlowItemPersisterExtensions {
        const string CLEAR_STEP = "clear";
        const string LAYER_STEP = "layer";
        const string ROW_STEP = "row";
        const string AGGREGATOR_STEP = "aggregator";
        static readonly string[] prevent_changes_step = { $"{LAYER_STEP}!", $"{ROW_STEP}!", $"{AGGREGATOR_STEP}!" };

        static bool StrEquals(this string val, string other) => val.Equals(other, StringComparison.OrdinalIgnoreCase);
        static bool StrStartsWithContains(this string[] values, string value) => values.Any(v => value?.StartsWith(v, StringComparison.OrdinalIgnoreCase) ?? false);

        public static bool IsImagePersisterClearStep(this FlowItem flowItem) =>
        CLEAR_STEP.StrEquals(flowItem.RunOptions.ImagePersister?.BuildStep);

        public static bool IsImagePersisterPreventChanges(this FlowItem flowItem) =>
        prevent_changes_step.StrStartsWithContains(flowItem.RunOptions.ImagePersister?.BuildStep);

        public static object ImagePersisterBuildStep(this FlowItem flowItem) {
            var buildStep = flowItem.RunOptions.ImagePersister?.BuildStep ?? string.Empty;
            switch (buildStep.ToLower()) {
                case string buildLayer when buildLayer.StartsWith(LAYER_STEP):
                    var layerName = buildStep.Split(':').Last().Trim();
                    return new BuildLayerStep(layerName);
                case string step when step.StartsWith(ROW_STEP):
                    return BuildStep.Row;
                case string step when step.StartsWith(AGGREGATOR_STEP):
                    return BuildStep.Aggregator;
                default:
                    return BuildStep.Last;
            }
        }
    }
}
