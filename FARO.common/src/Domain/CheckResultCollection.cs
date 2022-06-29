using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;

namespace FARO.Common.Domain {
    public enum CheckResultLevel {
        Info,
        Warning,
        Error
    }

    public enum CheckArea {
        KeysIterator,
        Decorator,
        Image,
        Validator,
        Aggregator,
        Writer,
        Flow
    }

    [DataContract]
    public class CheckResultItem {
        [DataMember(Name = "ts")] public DateTime TS { get; set; }
        [DataMember(Name = "area")] public CheckArea Area { get; set; }
        [DataMember(Name = "level")] public CheckResultLevel Level { get; set; }
        [DataMember(Name = "message")] public string Message { get; set; }
        [DataMember(Name = "id")] public string Id { get; set; }

    }

    [DataContract]
    public class CheckResultCollection {
        List<CheckResultItem> _items = new();

        public void Clear() { _items.Clear(); }
        public CheckResultCollection AddInfo(CheckArea area, string message, string id = null) {
            _items.Add(new CheckResultItem { TS = DateTime.UtcNow, Area = area, Level = CheckResultLevel.Info, Message = message, Id = id });
            return this;
        }
        public CheckResultCollection AddWarning(CheckArea area, string message, string id = null) {
            _items.Add(new CheckResultItem { TS = DateTime.UtcNow, Area = area, Level = CheckResultLevel.Warning, Message = message, Id = id });
            return this;

        }
        public CheckResultCollection AddError(CheckArea area, string message, string id = null) {
            _items.Add(new CheckResultItem { TS = DateTime.UtcNow, Area = area, Level = CheckResultLevel.Error, Message = message, Id = id });
            return this;
        }

        [DataMember(Name = "hasErrors")] public bool HasErrors => _items.Any(i => i.Level == CheckResultLevel.Error);

        public CheckResultCollection AddAll(CheckResultCollection items) { _items = new List<CheckResultItem>(_items.Union(items._items)); return this; }

        [DataMember(Name = "items")] public IEnumerable<CheckResultItem> Items => _items.AsReadOnly();
    }
}
