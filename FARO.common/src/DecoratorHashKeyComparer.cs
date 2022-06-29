using System;
using System.Collections.Generic;

namespace FARO.Common {
    public class DecoratorHashKeyComparer : IEqualityComparer<LayerFieldItem> {
        private DecoratorHashKeyComparer() { }
        public static readonly DecoratorHashKeyComparer Instance = new();
        public bool Equals(LayerFieldItem x, LayerFieldItem y) {
            return x.Decorator.HashKey.Equals(y.Decorator.HashKey);
        }

        public int GetHashCode(LayerFieldItem obj) {
            return obj.Decorator.HashKey.GetHashCode();
        }

        public static Func<LayerFieldItem, bool> Compare(LayerFieldItem layerField) => field => field.Decorator.HashKey == layerField.Decorator.HashKey;
        public static Func<LayerFieldItem, bool> Compare(IDecorator decorator) => field => field.Decorator.HashKey == decorator.HashKey;
    }
}
