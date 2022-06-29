using FARO.Common;
using FARO.Common.Domain;

namespace FARO.Addons.Rdb {
    internal static class SqlSourceHelper {
        internal static (string connectionString, string? commandText) GetSqlSourceConfig(SourceDefinition sourceDefinition, IConnectionRetriever? connectionRetriever = null) {
            var source = SqlSource.CreateFromDefinition(sourceDefinition);
            var connectionString = source.Connection ?? throw new NullReferenceException("Connection cannot be null!");
            if (connectionRetriever is not null) {
                connectionString = connectionRetriever.GetConnectionString(connectionString) ?? throw new NullReferenceException($"[RETRIEVER] Connection {connectionString} not found!");
            }
            return (connectionString, source.SqlBody);
        }
    }
}
