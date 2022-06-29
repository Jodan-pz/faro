using System.Data;
using System.Data.SqlClient;
using FARO.Common;

namespace FARO.Addons.Rdb.KeysIterators.Engine {
    public class MSSQLKeysIteratorEngine : SQLKeysIteratorEngine {
        public MSSQLKeysIteratorEngine(IConnectionRetriever? connectionRetriever) : base(connectionRetriever) {
        }

        protected override IDbConnection CreateConnection(string connectionString)
        => new SqlConnection(connectionString);
    }
}