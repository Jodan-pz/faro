using FARO.Common;
using System.Data;
using MySqlConnector;

namespace FARO.Addons.Rdb.Decorators.Engine {
    public class MySqlDecoratorEngine : SQLDecoratorEngine {
        public MySqlDecoratorEngine(IExpressionEvaluator expressionEvaluator, IConnectionRetriever? connectionRetriever) : base(expressionEvaluator, connectionRetriever) {
        }

        protected override IDbConnection CreateConnection(string connectionString)
        => new MySqlConnection(connectionString);
    }
}