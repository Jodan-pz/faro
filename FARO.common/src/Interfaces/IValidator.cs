using System.Collections.Generic;
using FARO.Common.Domain;

namespace FARO.Common {
    public interface IValidator {
        ValidatorDefinition Definition { get; }
        IEnumerable<FieldDescription> GetFields();
        ValidatorResult Validate(IImageOutput output);
    }
}