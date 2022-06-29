using System.Data;
using AdoNetCore.AseClient;
using FARO.Addons.Rdb.Extensions;
using FARO.Common;

namespace FARO.Addons.Rdb.KeysIterators.Engine {
    public class SybaseKeysIteratorEngine : SQLKeysIteratorEngine {
        public SybaseKeysIteratorEngine(IConnectionRetriever? connectionRetriever = null) : base(connectionRetriever) {
        }

        protected override IDbConnection CreateConnection(string connectionString)
        => new AseConnection(connectionString?.ToSybase());
    }
}
