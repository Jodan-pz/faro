using System.Collections.Generic;
using FARO.Common.Domain;

namespace FARO.Common {
    public interface ISource {
        IEnumerable<Argument> Arguments { get; }
    }

    public interface IDecoratorSource : ISource { }
    public interface IKeysIteratorSource : ISource { }
}