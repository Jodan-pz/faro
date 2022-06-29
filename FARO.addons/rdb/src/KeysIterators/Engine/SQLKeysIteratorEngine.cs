using System.Data;

using FARO.Common;
using FARO.Common.Exceptions;
using static FARO.Addons.Rdb.SqlSourceHelper;

namespace FARO.Addons.Rdb.KeysIterators.Engine {
    public abstract class SQLKeysIteratorEngine : IKeysIteratorEngine {
        readonly IConnectionRetriever? _connectionRetriever;

        protected abstract IDbConnection CreateConnection(string connectionString);

        protected virtual IDbCommand? CreateCommand(IDbConnection connection) => connection?.CreateCommand();

        protected SQLKeysIteratorEngine(IConnectionRetriever? connectionRetriever = null) {
            _connectionRetriever = connectionRetriever;
        }

        public IEnumerable<IDictionary<string, object?>> GetKeys(IKeysIterator keysIterator, IDictionary<string, object> args, IDataResourceService dataResource) {
            if (!(keysIterator.Definition.Fields?.Any() ?? false)) yield break;
            (var connectionString, var commandText) = GetSqlSourceConfig(keysIterator.Definition.Source, _connectionRetriever);
            using var con = CreateConnection(connectionString);
            con.Open();
            var cmd = CreateCommand(con);
            if (cmd is not null) {
                cmd.CommandText = commandText;
                SetParameters(cmd, keysIterator, args);
                using var rdr = cmd.ExecuteReader();
                while (rdr.Read()) {
                    var ret = new Dictionary<string, object?>();
                    foreach (var output in keysIterator.Definition.Fields) {
                        var fieldName = keysIterator.GetOutputFieldName(output.Name);
                        var fieldValue = output.SelectorOrName;
                        var colIndex = ColumnIndex(fieldValue, rdr);
                        ret.Add(fieldName, colIndex != -1 ? rdr.GetValue(colIndex) : null);
                    }
                    yield return ret;
                }
            }
            yield break;
        }

        static int ColumnIndex(string columnName, IDataReader reader) {
            try {
                var ord = reader.GetOrdinal(columnName);
                return ord;
            } catch (IndexOutOfRangeException) {
                return -1;
            }
        }

        static void SetParameters(IDbCommand cmd, IKeysIterator keysIterator, IDictionary<string, object> args) {
            if (args != null && keysIterator.Definition.Arguments != null) {
                foreach (var arg in keysIterator.Definition.Arguments) {
                    var par = cmd.CreateParameter();
                    par.ParameterName = arg.Name;
                    var argSel = keysIterator.GetArgumentName(arg.Name);
                    var argValue = args.ContainsKey(argSel) ? args[argSel] : null;
                    if (!arg.Optional && argValue == null) throw new NullArgumentValueException(keysIterator, argSel != arg.Name ? $"{arg.Name} as {argSel}" : argSel, args);
                    par.Value = argValue ?? DBNull.Value;
                    cmd.Parameters.Add(par);
                }
            }
        }
    }
}
