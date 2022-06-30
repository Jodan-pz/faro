using FARO.Common;

namespace FARO.Addons.Test {

    class VoidExpressionEvaluator : IExpressionEvaluator {
        public static readonly VoidExpressionEvaluator Instance = new VoidExpressionEvaluator();

        public bool EvalCondition(string condition, ImageOutputRow row) => true;

        public bool EvalCondition(string condition, IDictionary<string, object> values) => true;

        public object? EvalExpression(object expression, ImageOutputRow row) => null;

        public object? Evaluate(string expression, object? context) => null;

        public void ForEachField(string expression, Action<string, string, object[]> action, params object[] args) { }
    }
}