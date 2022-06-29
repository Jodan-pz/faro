using System;
using System.Collections.Concurrent;
using System.Collections.Generic;

namespace FARO.Common {
    public interface IImageOutput {
        Action<ChangeOutputEventArgs> OnChange { get; }
        Action<ImageOutputRow> OnIterate { get; set; }
        int Size { get; }
        ImageOutputRow AddKey(IDictionary<string, object> keys = null);
        void AddRow(ImageOutputRow row);
        void IterateRows(Func<ImageOutputRow, bool> rowPredicate);
        void IterateRows(Action<ImageOutputRow> rowPredicate);
        Partitioner<ImageOutputRow> Partitioner(int chunkSize);
    }
}