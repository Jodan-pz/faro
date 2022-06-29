using System;
using System.Collections.Generic;
using FARO.Common.Domain;

namespace FARO.Common {
    public interface IImage {
        ImageDefinition Definition { get; }
        IImageItemResolver ItemResolver { get; }
        Action<ImageWatcherItem> OnWatchItem { get; set; }

        void BuildSchema();

        void IterateKeys(IDictionary<string, object> args, Action<IDictionary<string, object>> key);
        void IterateKeys(IDictionary<string, object> args, Func<IDictionary<string, object>, bool> key);
        void EvalLayers(ImageOutputRow outputRow);
    }
}
