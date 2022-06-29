using System.Linq;
using System.Runtime.Serialization;

namespace FARO.Common.Domain {
    [DataContract]
    public class OutputField {
        public static OutputField[] Array(params string[] names) => names?.Select(n => new OutputField(n)).ToArray();

        public OutputField() { }
        public OutputField(string name, string selector) {
            Name = name;
            Selector = selector;
        }
        public OutputField(string name) : this(name, name) { }

        [DataMember(Name = "name")] public string Name { get; set; }
        [DataMember(Name = "selector")] public string Selector { get; set; }
        [DataMember(Name = "type")] public string Type { get; set; }
        [DataMember(Name = "format")] public string Format { get; set; }
        [DataMember(Name = "value")] public object Value { get; set; }

        public string SelectorOrName => Selector ?? Name;

        public override string ToString() {
            var ret = $"{Name}: {Selector}";
            if (Type != null) ret += $" - {Type}";
            if (Format != null) ret += $" ({Format})";
            if (Value != null) ret += " -> {Value}";
            return ret;
        }
    }
}
