using System;
using System.Collections.Concurrent;
using System.Collections.Concurrent.Partitioners;
using System.Collections.Generic;
using System.Linq;
using FARO.Common.Helpers;

namespace FARO.Common {
    public enum ImageOutputChangeType {
        Keys,
        Layer,
        Row,
        Aggregation
    }

    public class ChangeOutputEventArgs {
        public ChangeOutputEventArgs(object sender,
                                     ImageOutputChangeType changeType,
                                     ILayer layer = null,
                                     IImageOutput output = null) {
            Sender = sender;
            ChangeType = changeType;
            Row = sender as ImageOutputRow;
            Output = output;
            Layer = layer;
        }

        public object Sender { private set; get; }
        public ImageOutputChangeType ChangeType { private set; get; }
        public IImageOutput Output { private set; get; }
        public ImageOutputRow Row { private set; get; }
        public ILayer Layer { private set; get; }
    }

    public class ImageOutput : IImageOutput {
        readonly List<ImageOutputRow> _rows;
        public int Size => _rows.Count;

        public Action<ChangeOutputEventArgs> OnChange { get; set; } = null;

        public Action<ImageOutputRow> OnIterate { get; set; } = null;

        public ImageOutput() {
            _rows = new List<ImageOutputRow>();
        }

        public ImageOutput(IEnumerable<IDictionary<string, object>> values, Action<ImageOutputRow> withRow = null) : this() {
            InitWithRange(values, withRow);
        }

        public Partitioner<ImageOutputRow> Partitioner(int chunkSize) => ChunkPartitioner.Create(_rows, chunkSize);

        public void IterateRows(Func<ImageOutputRow, bool> rowPredicate) {
            foreach (var row in _rows) {
                OnIterate?.Invoke(row);
                if (!(row.Discard ?? false)) {
                    if (!rowPredicate(row)) {
                        break;
                    }
                }
            }
        }

        public void IterateRows(Action<ImageOutputRow> rowPredicate) => IterateRows(row => { rowPredicate(row); return true; });

        public ImageOutputRow AddRow(IDictionary<string, object> values) {
            var rowToAdd = CreateRow(values);
            InternalAdd(rowToAdd);
            return rowToAdd;
        }

        public void AddRow(ImageOutputRow row) {
            InternalAdd(row);
            row.RowComplete();
        }

        public ImageOutputRow AddKey(IDictionary<string, object> keys = null) {
            var keyRow = keys?.ToDictionary(k => PrefixHelper.KeyName(k.Key), v => v.Value) ?? new Dictionary<string, object>();
            var keysToAdd = CreateRow(keyRow);
            InternalAdd(keysToAdd);
            if (keys is not null) {
                keysToAdd.KeysConplete();
            }
            return keysToAdd;
        }

        ImageOutputRow CreateRow(IDictionary<string, object> values) => new(this, values);

        void InternalAdd(ImageOutputRow row) {
            if (row is null) return;
            row.Idx = _rows.Count + 1;
            row.ImageOutput = this;
            _rows.Add(row);
        }

        void InitWithRange(IEnumerable<IDictionary<string, object>> values = null, Action<ImageOutputRow> withRow = null) {
            if (values is null) return;
            var idx = 1;
            _rows.AddRange(
                values.Select(value => {
                    var rowToAdd = CreateRow(value);
                    rowToAdd.Idx = idx++;
                    withRow?.Invoke(rowToAdd);
                    return rowToAdd;
                })
            );
        }
    }
}
