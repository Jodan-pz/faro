using System.Globalization;
using System.Text;
using FARO.Common;
using FARO.Common.Helpers;

namespace FARO.Addons.Common {
    public static class StringHelper {
        /// <summary>
        /// Retrieve culture by name
        /// </summary>
        /// <param name="culture">Culture identifier</param>
        /// <returns>Cultureinfo object</returns>
        public static CultureInfo GetCulture(string? culture) {
            if (MiscHelper.IsNullOrEmpty(culture)) return CultureInfo.InvariantCulture;
            CultureInfo ret;
            try {
                ret = CultureInfo.CreateSpecificCulture(culture!);
            } catch {
                ret = CultureInfo.InvariantCulture;
            }
            return ret;

        }

        /// <summary>
        /// Retrieve encoding by name
        /// </summary>
        /// <param name="encoding">Encoding name</param>
        /// <returns>Encoding object or default</returns>
        public static Encoding GetEncoding(string? encoding) {
            if (MiscHelper.IsNullOrEmpty(encoding)) return Encoding.Default;
            Encoding ret;
            try {
                ret = Encoding.GetEncoding(encoding!);
            } catch {
                ret = Encoding.Default;
            }
            return ret;
        }
    }
}