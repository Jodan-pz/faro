using System.Collections.Generic;
using FARO.Common;
using FARO.Common.Helpers;
using System.Linq;
using System.Threading.Tasks;

namespace FARO.Services.Decorators.Engine {
    public class KeyDecoratorEngine : IDecoratorEngine {
        public Task<IDictionary<string, object>> GetValuesAsync(IDecorator decorator, ImageOutputRow imageOutputRow, IDataResourceService dataResource) {
            var kval = decorator.Arguments.First();
            var keyName = PrefixHelper.KeyName(kval.Value);
            IDictionary<string, object> ret = new Dictionary<string, object>
            {
                { kval.Name, imageOutputRow.GetValue($"{{{keyName}}}") }
            };
            return Task.FromResult(ret);
        }
    }
}
