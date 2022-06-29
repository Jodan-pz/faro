using System.Collections.Generic;
using System.Threading.Tasks;

namespace FARO.Common {
    public interface IDecoratorEngine {
        Task<IDictionary<string, object>> GetValuesAsync(IDecorator decorator, ImageOutputRow imageOutputRow, IDataResourceService dataResource);
    }
}