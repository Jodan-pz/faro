using System.Collections.Immutable;
using System;
using System.Collections.Generic;
using System.Linq;
using FARO.Common.Helpers;

namespace FARO.Common {
    public class ImageOutputRow {
        readonly IDictionary<string, object> _row;

        public int Idx { get; internal set; }
        public bool? Discard { get; set; } = null;

        internal IImageOutput ImageOutput { get; set; } = null;

        public ImageOutputRow() {
            _row = new Dictionary<string, object>();
        }

        public ImageOutputRow(IImageOutput imageOutput, IDictionary<string, object> initRowValues = null) : this() {
            ImageOutput = imageOutput;
            _row = initRowValues ?? _row;
        }

        public ImageOutputRow(IImageOutput imageOutput, ImageOutputRow row) : this(imageOutput) {
            _row = row._row;
        }

        public ImageOutputRow(ImageOutputRow row) : this(null, row) { }

        public void SetValue(string name, object value) {
            if (!_row.ContainsKey(name))
                _row.Add(name, value);
            else
                _row[name] = value;
        }

        public object GetValue(object name) => GetValue(name?.ToString());

        public object GetValue(string name) {
            if (name == null) return null;
            if (name.StartsWith("{", StringComparison.OrdinalIgnoreCase) && name.EndsWith("}", StringComparison.OrdinalIgnoreCase)) {
                name = name.TrimStart('{').TrimEnd('}');
                if (_row.ContainsKey(name)) return _row[name];
                var asKey = PrefixHelper.KeyName(name);
                if (_row.ContainsKey(asKey)) return _row[asKey];
                return null;
            }
            return name;
        }

        public IDictionary<string, object> ToDictionary() => ImmutableDictionary.ToImmutableDictionary(_row);

        public TAccumulate Aggregate<TAccumulate>(TAccumulate seed, Func<TAccumulate, KeyValuePair<string, object>, TAccumulate> func) => _row.Aggregate(seed, func);

        public object GetValueExact(string exactName) => _row[exactName];

        public bool ContainsName(string name) => _row.ContainsKey(name);

        public dynamic GetDynamicValue(string exactName) => (dynamic)GetValueExact(exactName);

        public T GetValueExactAs<T>(string exactName) {
            var val = GetValueExact(exactName);
            if (val != null) {
                if (val is T t) return t;
                return (T)Convert.ChangeType(val, typeof(T));
            }
            return default;
        }

        /// <summary>
        /// Keys complete notifier
        /// </summary>
        /// <returns></returns>
        public void KeysConplete() => ImageOutput?.OnChange?.Invoke(new ChangeOutputEventArgs(this, ImageOutputChangeType.Keys));

        /// <summary>
        /// Layer complete notifier
        /// </summary>
        public void LayerComplete(ILayer layer) => ImageOutput?.OnChange?.Invoke(new ChangeOutputEventArgs(this, ImageOutputChangeType.Layer, layer));

        /// <summary>
        /// Row complete notifier
        /// </summary>
        /// <param name="layer"></param>
        public void RowComplete() => ImageOutput?.OnChange?.Invoke(new ChangeOutputEventArgs(this, ImageOutputChangeType.Row));
    }
}
