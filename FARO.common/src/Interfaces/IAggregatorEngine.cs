using System.Collections.Generic;
using FARO.Common.Domain;

namespace FARO.Common {
    public interface IAggregatorEngine {
        IEnumerable<FieldDescription> GetFields(AggregatorDefinition aggregatorDefinition);
        IEnumerable<string> GetAggregatedFields(AggregatorDefinition aggregatorDefinition);
        IImageOutput Aggregate(IAggregator aggregator, IImageOutput imageOutput, IDataResourceService dataResource);
    }
}
