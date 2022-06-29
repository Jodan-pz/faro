using System.Data;

using FARO.Common;
using FARO.Common.Exceptions;
using static FARO.Addons.Rdb.SqlSourceHelper;

namespace FARO.Addons.Rdb.Decorators.Engine {
    public abstract class SQLDecoratorEngine : IDecoratorEngine {
        private readonly IExpressionEvaluator _expressionEvaluator;
        private readonly IConnectionRetriever? _connectionRetriever;

        protected abstract IDbConnection CreateConnection(string connectionString);

        protected virtual IDbCommand? CreateCommand(IDbConnection connection) => connection?.CreateCommand();

        protected SQLDecoratorEngine(IExpressionEvaluator expressionEvaluator, IConnectionRetriever? connectionRetriever = null) {
            _expressionEvaluator = expressionEvaluator ?? throw new ArgumentNullException(nameof(expressionEvaluator));
            _connectionRetriever = connectionRetriever;
        }

        public Task<IDictionary<string, object?>> GetValuesAsync(IDecorator decorator, ImageOutputRow imageOutputRow, IDataResourceService dataResource) {
            Dictionary<string, object?> ret = new();
            (var connectionString, var commandText) = GetSqlSourceConfig(decorator.Definition.Source, _connectionRetriever);
            using (var con = CreateConnection(connectionString)) {
                con.Open();
                var cmd = CreateCommand(con);
                if (cmd is not null) {
                    cmd.CommandText = commandText;
                    if (!SetParameters(cmd, decorator, imageOutputRow)) {
                        FillEmptyResult(decorator, ret);
                        return Task.FromResult<IDictionary<string, object?>>(ret);
                    }

                    if (!(decorator.Definition.Fields?.Any() ?? false)) {
                        ret.Add("result", cmd.ExecuteScalar());
                    } else {
                        var rdr = cmd.ExecuteReader();
                        if (rdr.Read()) {
                            foreach (var field in decorator.Definition.Fields) {
                                var valueToken = rdr[field.SelectorOrName];
                                ret.Add(field.Name, valueToken);
                            }
                        } else {
                            FillEmptyResult(decorator, ret);
                        }
                    }
                }
            }
            return Task.FromResult<IDictionary<string, object?>>(ret);
        }

        static void FillEmptyResult(IDecorator decorator, IDictionary<string, object?> result) {
            foreach (var field in decorator.Definition.Fields) {
                result.Add(field.Name, null);
            }
        }

        bool SetParameters(IDbCommand cmd, IDecorator decorator, ImageOutputRow imageOutputRow) {
            var ret = true;
            if (decorator.Arguments?.Any() ?? false) {
                var dicArgValues = new Dictionary<string, object?>();
                foreach (var arg in decorator.Arguments) {
                    var par = cmd.CreateParameter();
                    par.ParameterName = arg.Name;
                    var argValue = imageOutputRow.GetValue(arg.Value ?? $"{{{arg.Name}}}");
                    if (!arg.Optional && argValue == null) throw new NullArgumentValueException(decorator, arg.Name, imageOutputRow);
                    par.Value = argValue ?? DBNull.Value;
                    cmd.Parameters.Add(par);
                    dicArgValues.Add(arg.Name, argValue);
                }
                ret = _expressionEvaluator.EvalCondition(decorator.Definition.When, dicArgValues);
            }
            return ret;
        }
    }
}
