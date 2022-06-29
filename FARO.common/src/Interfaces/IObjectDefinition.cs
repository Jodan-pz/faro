using System.Collections.Generic;

namespace FARO.Common {
    public interface IObjectDefinition {
        string Id { get; set; }
        string Name { get; set; }
        string Description { get; set; }
        IEnumerable<string> Tags { get; set; }
    }
}