using System.Runtime.Serialization;

namespace FARO.Common.Domain {
    [DataContract]
    public class ArgumentValue : Argument {
        public ArgumentValue() { }
        public ArgumentValue(string name, string description, bool optional, object value = null) {
            Name = name;
            Description = description;
            Optional = optional;
            Value = value;
        }

        public ArgumentValue(Argument argument, object value = null) : this(argument?.Name, argument?.Description, argument?.Optional ?? true, value) { }

        [DataMember(Name = "value")] public object Value { get; set; }

        public override string ToString() => $"{Name} {Description}: {Value}";
    }
}