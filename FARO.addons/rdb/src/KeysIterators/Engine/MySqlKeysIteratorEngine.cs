using System.Data;
using FARO.Common;
using MySqlConnector;

namespace FARO.Addons.Rdb.KeysIterators.Engine {
    public class MySqlKeysIteratorEngine : SQLKeysIteratorEngine {
        public MySqlKeysIteratorEngine(IConnectionRetriever? connectionRetriever) : base(connectionRetriever) {
        }

        protected override IDbConnection CreateConnection(string connectionString)
        => new MySqlConnection(connectionString);
    }
}