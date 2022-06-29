using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace FARO.Common.Helpers {

    public static class MiscHelper {
        public static bool IsNullOrEmpty(string value) {
            if (value is null) return true;
            return value.Trim().Length == 0;
        }

        public static T GetValueOrNull<T>(T value) {
            if (typeof(T).GetTypeInfo().IsValueType) return value;
            if (value == null) return default;
            if (value is string) {
                if (value.ToString().Trim().Length == 0)
                    value = default;
                else
                    value = (T)(object)value.ToString().Trim();
            }
            return value;
        }

        public static IEnumerable<T> Paginate<T>(this IEnumerable<T> query, int? pageIndex = null, int? pageSize = null) {
            return query.AsQueryable().Paginate(pageIndex, pageSize);
        }

        public static IQueryable<T> Paginate<T>(this IQueryable<T> query, int? pageIndex = null, int? pageSize = null) {
            if (pageIndex != null && pageSize != null) {
                var skipCount = (pageIndex.Value - 1) * pageSize.Value;
                return query.Skip(skipCount).Take(pageSize.Value);
            }
            return query;
        }

    }
}