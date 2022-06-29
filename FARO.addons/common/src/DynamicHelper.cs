using System.Globalization;

namespace FARO.Addons.Common {
    public static class DynamicHelper {
        /// <summary>
        /// Change a value type (using default invariant format culture)
        /// </summary>
        /// <param name="value">The value to change the type</param>
        /// <param name="type">New .Net type name</param>
        /// <returns></returns>
        public static dynamic ChangeType(dynamic? value, string type) => ChangeType(value, type, CultureInfo.InvariantCulture);
        /// <summary>
        /// Change a value type
        /// </summary>
        /// <param name="value">The value to change the type</param>
        /// <param name="type">New .Net type name</param>
        /// <param name="formatCulture">Culture for type conversion</param>
        /// <returns></returns>
        public static dynamic? ChangeType(dynamic? value,
                                          string type,
                                          IFormatProvider formatCulture) {
            if (!string.IsNullOrEmpty(type) && value != null) {
                value = Convert.ChangeType(value, Type.GetType($"System.{type}", true, true), formatCulture);
            }
            return value;
        }
    }
}