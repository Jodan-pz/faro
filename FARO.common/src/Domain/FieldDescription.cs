using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;

namespace FARO.Common.Domain {
    public class FieldDescription : IEqualityComparer<FieldDescription> {
        readonly string _name;
        readonly string _description;

        public FieldDescription(string name, string description = null) {
            _name = name;
            _description = description;
        }

        public string Name => _name;
        public string Description => _description;

        // override object.Equals
        public override bool Equals(object obj) {
            if (obj == null || GetType() != obj.GetType()) {
                return false;
            }
            var other = obj as FieldDescription;
            return Name == other.Name &&
                   Description == other.Description;
        }

        public override int GetHashCode() {
            return (Name?.GetHashCode() ?? 0) ^ (Description?.GetHashCode() ?? 0);
        }

        public int GetHashCode([DisallowNull] FieldDescription obj) => obj.GetHashCode();


        public bool Equals(FieldDescription x, FieldDescription y) {
            if (x == null && y == null)
                return true;
            else if (x == null || y == null)
                return false;
            return x.Equals(y);
        }


        public override string ToString() {
            return Name;
        }

        public static FieldDescription Create(string name) => Create(name, null);
        public static FieldDescription Create(string name, string description) => new(name, description);
    }
}
