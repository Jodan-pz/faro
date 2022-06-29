using System.Collections.Generic;

namespace FARO.Common {
    public interface IKeysIteratorEngine {
        IEnumerable<IDictionary<string, object>> GetKeys(IKeysIterator keysIterator, IDictionary<string, object> args, IDataResourceService dataResource);
    }
}
