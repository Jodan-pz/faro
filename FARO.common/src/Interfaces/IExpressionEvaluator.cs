using System;
using System.Collections.Generic;

namespace FARO.Common {
    public interface IExpressionEvaluator {
        void ForEachField(string expression, Action<string, string, object[]> action, params object[] args);
        bool EvalCondition(string condition, ImageOutputRow row);
        bool EvalCondition(string condition, IDictionary<string, object> values);
        object EvalExpression(object expression, ImageOutputRow row);
    }
}