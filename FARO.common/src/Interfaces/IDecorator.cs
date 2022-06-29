using System.Collections.Generic;
using System.Threading.Tasks;
using FARO.Common.Domain;

namespace FARO.Common {
    public interface IDecorator {
        IEnumerable<ArgumentValue> Arguments { get; }
        DecoratorDefinition Definition { get; }
        string HashKey { get; }
        string Map { get; }
        Task<IDictionary<string, object>> GetValuesAsync(ImageOutputRow imageOutputRow);
    }
}