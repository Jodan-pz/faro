using System.Data;
using FARO.Common;
using Oracle.ManagedDataAccess.Client;

namespace FARO.Addons.Rdb.KeysIterators.Engine {
    public class OracleKeysIteratorEngine : SQLKeysIteratorEngine {
        public OracleKeysIteratorEngine(IConnectionRetriever? connectionRetriever = null) : base(connectionRetriever) {
        }

        protected override IDbConnection CreateConnection(string connectionString)
        => new OracleConnection(connectionString);

        protected override IDbCommand? CreateCommand(IDbConnection connection) {
            var command = connection.CreateCommand() as OracleCommand;
            if (command != null) command.BindByName = true;
            return command;
        }
    }
}
