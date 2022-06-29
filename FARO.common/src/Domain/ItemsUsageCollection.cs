using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;

namespace FARO.Common.Domain {
    #region Base

    [DataContract]
    public class ObjectDefinitionDescriptor {
        [DataMember(Name = "id")] public string Id { get; set; }
        [DataMember(Name = "name")] public string Name { get; set; }
        [DataMember(Name = "description")] public string Description { get; set; }

        public static ObjectDefinitionDescriptor Create(IObjectDefinition definition) => new()
        {
            Id = definition?.Id,
            Name = definition?.Name,
            Description = definition?.Description
        };
    }

    [DataContract]
    public class BaseUsageItem {
        [DataMember(Name = "flows")] public IEnumerable<ObjectDefinitionDescriptor> Flows { get; set; }
    }

    [DataContract]
    public class GenericUsageCollection<T> where T : BaseUsageItem {
        readonly List<T> _items = new();
        public void Clear() { _items.Clear(); }
        public void Add(T item) => _items.Add(item);
        public void AddAll(IEnumerable<T> items) => _items.AddRange(items);
        [DataMember(Name = "items")] public IEnumerable<T> Items => _items.AsEnumerable();
        [DataMember(Name = "subject")] public ObjectDefinitionDescriptor Subject { get; set; }

    }
    #endregion

    #region Items  

    [DataContract]
    public class ImageUsageItem : BaseUsageItem { }

    [DataContract]
    public class KeysIteratorUsageItem : BaseUsageItem {
        [DataMember(Name = "image")] public ObjectDefinitionDescriptor Image { get; set; }
        [DataMember(Name = "keys")] public IEnumerable<ObjectDefinitionDescriptor> Keys { get; set; }
    }

    [DataContract]
    public class DecoratorUsageItem : BaseUsageItem {
        [DataMember(Name = "image")] public ObjectDefinitionDescriptor Image { get; set; }
        [DataMember(Name = "fields")] public IEnumerable<string> Fields { get; set; }
    }

    [DataContract]
    public class ValidatorUsageItem : BaseUsageItem {
        [DataMember(Name = "validators")] public IEnumerable<ObjectDefinitionDescriptor> Validators { get; set; }
    }

    [DataContract]
    public class AggregatorUsageItem : BaseUsageItem { }

    [DataContract]
    public class WriterUsageItem : BaseUsageItem {
        [DataMember(Name = "writers")] public IEnumerable<ObjectDefinitionDescriptor> Writers { get; set; }
    }

    #endregion

    #region Collections

    [DataContract]
    public class ImageUsageCollection : GenericUsageCollection<ImageUsageItem> { }

    [DataContract]
    public class KeysIteratorUsageCollection : GenericUsageCollection<KeysIteratorUsageItem> { }

    [DataContract]
    public class DecoratorUsageCollection : GenericUsageCollection<DecoratorUsageItem> { }

    [DataContract]
    public class ValidatorUsageCollection : GenericUsageCollection<ValidatorUsageItem> { }

    [DataContract]
    public class AggregatorUsageCollection : GenericUsageCollection<AggregatorUsageItem> { }

    [DataContract]
    public class WriterUsageCollection : GenericUsageCollection<WriterUsageItem> { }

    #endregion
}
