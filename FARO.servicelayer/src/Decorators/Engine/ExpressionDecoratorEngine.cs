using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using FARO.Common;

namespace FARO.Services.Decorators.Engine {
    public class ExpressionDecoratorEngine : IDecoratorEngine {
        private readonly IExpressionEvaluator _expressionEvaluator;
        public ExpressionDecoratorEngine(IExpressionEvaluator expressionEvaluator) {
            _expressionEvaluator = expressionEvaluator;
        }

        public Task<IDictionary<string, object>> GetValuesAsync(IDecorator decoratorDefinition, ImageOutputRow imageOutputRow, IDataResourceService dataResource) {
            var kval = decoratorDefinition.Arguments.First();
            IDictionary<string, object> ret = new Dictionary<string, object>();
            var value = _expressionEvaluator.EvalExpression(kval.Value, imageOutputRow);
            ret.Add(kval.Name, value);
            return Task.FromResult(ret);
        }
    }
}