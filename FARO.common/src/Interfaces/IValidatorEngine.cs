using System.Collections.Generic;

using FARO.Common.Domain;

namespace FARO.Common {
    public interface IValidatorEngine {
        IEnumerable<FieldDescription> GetFields(ValidatorDefinition validatorDefinition);
        ValidatorResult Validate(IValidator validator, IImageOutput imageOutput, IDataResourceService dataResource);
    }
}
