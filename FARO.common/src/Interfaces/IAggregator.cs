using System.Collections.Generic;
using FARO.Common.Domain;

namespace FARO.Common {
    public interface IAggregator {
        AggregatorDefinition Definition { get; }
        IEnumerable<FieldDescription> GetFields();
        IEnumerable<string> GetAggregatedFields();
        IImageOutput Aggregate(IImageOutput output);
    }
}
