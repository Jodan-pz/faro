using AdoNetCore.AseClient;

namespace FARO.Addons.Rdb.Extensions {
    internal static class ConnectionString {
        /// <summary>
        /// Sybase connection string
        /// </summary>
        /// <param name="connectionString">A standard connection string (using odbc rules)</param>
        /// <returns>A sybase connection string</returns>
        internal static string ToSybase(this string connectionString) {
            var builder = AseClientFactory.Instance.CreateConnectionStringBuilder();
            builder.ConnectionString = connectionString;
            if (builder.TryGetValue("Data Source", out var ds)) {
                var splitted = ds?.ToString()?.Split('/');
                if (splitted is not null) {
                    builder["Data Source"] = splitted[0];
                    if (splitted.Length == 2) builder.Add("Database", splitted[1]);
                }
            }
            return builder.ConnectionString;
        }
    }
}
