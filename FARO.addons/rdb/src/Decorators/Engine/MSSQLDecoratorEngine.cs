using System.Data.SqlClient;
using FARO.Common;
using System.Data;

namespace FARO.Addons.Rdb.Decorators.Engine {
    public class MSSQLDecoratorEngine : SQLDecoratorEngine {
        public MSSQLDecoratorEngine(IExpressionEvaluator expressionEvaluator, IConnectionRetriever? connectionRetriever) : base(expressionEvaluator, connectionRetriever) {
        }

        protected override IDbConnection CreateConnection(string connectionString)
        => new SqlConnection(connectionString);
    }
}