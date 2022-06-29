using FARO.Common;
using Oracle.ManagedDataAccess.Client;
using System.Data;

namespace FARO.Addons.Rdb.Decorators.Engine {
    public class OracleDecoratorEngine : SQLDecoratorEngine {
        public OracleDecoratorEngine(IExpressionEvaluator expressionEvaluator, IConnectionRetriever connectionRetriever) : base(expressionEvaluator, connectionRetriever) {
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
