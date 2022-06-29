using System.Collections.Generic;
using FARO.Common.Domain;

namespace FARO.Common {
    public interface IDefinitionSupportService {
        IEnumerable<string> GetImageOutputFields(string imageId);
        IEnumerable<ValidatorDefinition> ListImageCompatibleValidators(string imageId);
        IEnumerable<WriterDefinition> ListImageCompatibleWriters(string imageId, string aggregatorId = null);
        IEnumerable<ArgumentValue> GetImageArguments(ImageDefinition image);
        DecoratorUsageCollection GetDecoratorUsage(string id);
        ImageUsageCollection GetImageUsage(string id);
        KeysIteratorUsageCollection GetKeysIteratorUsage(string id);
        AggregatorUsageCollection GetAggregatorUsage(string id);
        ValidatorUsageCollection GetValidatorUsage(string id);
        WriterUsageCollection GetWriterUsage(string id);
    }
}