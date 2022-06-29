using FARO.Common;
using System.Data;
using AdoNetCore.AseClient;
using FARO.Addons.Rdb.Extensions;

namespace FARO.Addons.Rdb.Decorators.Engine {
    public class SybaseDecoratorEngine : SQLDecoratorEngine {
        public SybaseDecoratorEngine(IExpressionEvaluator expressionEvaluator, IConnectionRetriever connectionRetriever) : base(expressionEvaluator, connectionRetriever) {
        }

        protected override IDbConnection CreateConnection(string connectionString)
        => new AseConnection(connectionString?.ToSybase());
    }
}
