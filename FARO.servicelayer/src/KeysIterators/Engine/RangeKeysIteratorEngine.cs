using System;
using System.Collections.Generic;
using System.Linq;

using FARO.Common;

namespace FARO.Services.KeysIterators.Engine {
    public class RangeKeysIteratorEngine : IKeysIteratorEngine {
        public IEnumerable<IDictionary<string, object>> GetKeys(IKeysIterator keysIterator, IDictionary<string, object> args, IDataResourceService dataResource) {
            if (!(keysIterator.Definition.Fields?.Any() ?? false)) yield break;
            var source = RangeSource.CreateFromDefinition(keysIterator.Definition.Source);
            var outFieldName = keysIterator.GetOutputFieldName(keysIterator.Definition.Fields.First().Name);
            var step = Math.Abs(source.Step);
            if (source.Start < source.End) {
                for (var i = source.Start; i <= source.End; i = checked(i + step)) {
                    yield return new Dictionary<string, object>() { [outFieldName] = i };
                }
            } else {
                for (var i = source.Start; i >= source.End; i = checked(i + (step * -1))) {
                    yield return new Dictionary<string, object>() { [outFieldName] = i };
                }
            }
        }
    }
}