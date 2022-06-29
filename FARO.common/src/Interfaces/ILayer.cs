using System.Collections.Generic;

namespace FARO.Common {
    public interface ILayer {
        string Name { get; }
        IList<LayerFieldItem> Items { get; }
    }
}