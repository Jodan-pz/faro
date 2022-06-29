using System.Collections.Generic;
using FARO.Common;
using System.Linq;
using System.Threading.Tasks;

namespace FARO.Services.Decorators.Engine {
    public class ConstantDecoratorEngine : IDecoratorEngine {
        public Task<IDictionary<string, object>> GetValuesAsync(IDecorator decoratorDefinition, ImageOutputRow imageOutputRow, IDataResourceService dataResource) {
            var kval = decoratorDefinition.Arguments.First();
            IDictionary<string, object> ret = new Dictionary<string, object>
            {
                { kval.Name, kval.Value }
            };
            return Task.FromResult(ret);
        }
    }
}
