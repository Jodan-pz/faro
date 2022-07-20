namespace FARO.Expression {
    public class NullVariable {
        readonly dynamic _value;
        public NullVariable(dynamic value) {
            _value = value;
        }

        public override bool Equals(object obj) {
            if (obj == null || GetType() != obj.GetType()) {
                return false;
            }

            return _value == ((NullVariable)obj)._value;
        }

        public override int GetHashCode() => _value.GetHashCode();

        public static bool operator ==(NullVariable left, NullVariable right) => left._value == right._value;
        public static bool operator !=(NullVariable left, NullVariable right) => left._value != right._value;
        public static bool operator >(NullVariable left, NullVariable right) => NotNull(left, right) && left._value > right._value;
        public static bool operator <(NullVariable left, NullVariable right) => NotNull(left, right) && left._value < right._value;
        public static bool operator >=(NullVariable left, NullVariable right) => NotNull(left, right) && left._value >= right._value;
        public static bool operator <=(NullVariable left, NullVariable right) => NotNull(left, right) && left._value <= right._value;

        public static dynamic operator +(NullVariable left, NullVariable right) => NotNull(left, right) ? left._value + right._value : null;
        public static dynamic operator -(NullVariable left, NullVariable right) => NotNull(left, right) ? left._value - right._value : null;
        public static dynamic operator *(NullVariable left, NullVariable right) => NotNull(left, right) ? left._value * right._value : null;
        public static dynamic operator /(NullVariable left, NullVariable right) => NotNull(left, right) ? left._value / right._value : null;

        public bool IsNull => _value == null;

        static bool NotNull(NullVariable left, NullVariable right) => !left.IsNull && !right.IsNull;
    }
}
