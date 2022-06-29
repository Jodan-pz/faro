using System;
using System.Collections.Generic;

namespace FARO.Common {
    [Serializable]
    public struct DecoratorCachedValue {
        public string Id { get; set; }
        public IDictionary<string, object> Result { get; set; }

        public DecoratorCachedValue(string id, IDictionary<string, object> result) {
            Id = id;
            Result = result;
        }
    }
}