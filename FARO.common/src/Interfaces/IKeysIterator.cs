using System;
using System.Collections.Generic;
using FARO.Common.Domain;

namespace FARO.Common {
    public interface IKeysIterator {
        KeysIteratorDefinition Definition { get; }
        string GetArgumentName(string name);
        string GetOutputFieldName(string name);
        void Iterate(IDictionary<string, object> args, Action<IDictionary<string, object>> keyPredicate, int? level = null);
        void Iterate(IDictionary<string, object> args, Func<IDictionary<string, object>, bool> keyPredicate, int? level = null);
    }
}
