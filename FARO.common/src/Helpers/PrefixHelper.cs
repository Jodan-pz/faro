using System;

namespace FARO.Common.Helpers {
    public static class PrefixHelper {
        const string PROV_DECORATOR_PREFIX = "#decorator:";
        const string PROV_KEY_PREFIX = "#key:";
        const string PROV_EXPRESSION_PREFIX = "#expr:";

        public static bool IsExpressionValue(string value, out string expressionValue) {
            expressionValue = value;
            if (value == null) return false;
            if (value.StartsWith(PROV_EXPRESSION_PREFIX, StringComparison.OrdinalIgnoreCase)) {
                expressionValue = value[PROV_EXPRESSION_PREFIX.Length..];
                return true;
            }
            return false;
        }

        public static bool IsKeyName(string name, out string keyName) {
            keyName = name;
            if (name == null) return false;
            if (name.StartsWith(PROV_KEY_PREFIX, StringComparison.OrdinalIgnoreCase)) {
                keyName = name[PROV_KEY_PREFIX.Length..];
                return true;
            }
            return false;
        }

        public static bool IsDecoratorName(string name, out string decoratorName) {
            decoratorName = name;
            if (name == null) return false;
            if (name.StartsWith(PROV_DECORATOR_PREFIX, StringComparison.OrdinalIgnoreCase)) {
                decoratorName = name[PROV_DECORATOR_PREFIX.Length..];
                return true;
            }
            return false;
        }

        public static string KeyName(object key) => KeyName(key?.ToString());
        public static string KeyName(string key) => key.StartsWith(PROV_KEY_PREFIX, StringComparison.OrdinalIgnoreCase) ? key : $"{PROV_KEY_PREFIX}{key}";
        public static string DecoratorName(string decorator) => decorator.StartsWith(PROV_DECORATOR_PREFIX, StringComparison.OrdinalIgnoreCase) ? decorator : $"{PROV_DECORATOR_PREFIX}{decorator}";
    }
}
