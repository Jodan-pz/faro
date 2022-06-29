using System.Data.Common;
using System.Globalization;
using System.Net;
using DHARMA.BaseClasses;
using DHARMA.Domain;
using DHARMA.Jacob.CommonUtils;
using FARO.Common;

namespace FARO.Dharma.Support {
    public class DharmaConnectionRetriever : IConnectionRetriever {
        readonly IWorkspace _dharmaWorkspace;
        readonly IDictionary<string, DharmaConnection> _connections = new Dictionary<string, DharmaConnection>(StringComparer.InvariantCultureIgnoreCase);

        public DharmaConnectionRetriever(IDharmaInstance dharma) {
            var dharmaInst = dharma ?? throw new ArgumentNullException(nameof(dharma));
            if (!dharmaInst.IsValid) throw new ApplicationException("Dharma instance is invalid!");
            _dharmaWorkspace = dharmaInst.GetWorkspace() ?? throw new NullReferenceException("Workspace cannot be null!");
        }

        public void Init() {
            // prefill connections
            _connections.Clear();
            try {
                foreach (var connection in _dharmaWorkspace.GetCurrentEntityConnections()) _connections.Add(connection.LinkName, connection);
            } catch { /* skip connection errors */}
        }

        public string GetConnectionString(string connection) {
            if (!IsDharmaConnection(connection, out var name)) return connection;
            var conn = (_connections.ContainsKey(name) ? _connections[name] : null) ?? throw new NullReferenceException($"Cannot find connection with name: {name}");
            if (conn.IsMSSQLServer) return CryptHelper.Decryptor(conn.SecuredData);
            var hostAndPort = conn.Server.Split(':');
            var csBuilder = new DbConnectionStringBuilder()
            {
                { "Host", hostAndPort.First() },
                { "Database", conn.Catalog },
                { "User ID", conn.User },
                { "Password", CryptHelper.Decryptor(conn.SecuredData) }
            };
            if (hostAndPort.Length > 1 && int.TryParse(hostAndPort.Last(), out var port)) {
                csBuilder.Add("Port", port);
            }
            return csBuilder.ConnectionString;
        }

        public string GetServer(string connection) {
            if (!IsDharmaConnection(connection, out var name)) return connection;
            var conn = (_connections.ContainsKey(name) ? _connections[name] : null) ?? throw new NullReferenceException($"Cannot find connection with name: {connection}");
            return conn.Server;
        }

        public IWebProxy GetProxyConnection(string connection) {
            if (!IsDharmaConnection(connection, out var name)) return new WebProxy(connection);
            var conn = (_connections.ContainsKey(name) ? _connections[name] : null) ?? throw new NullReferenceException($"Cannot find connection with name: {connection}");
            var proxy = new WebProxy
            {
                Address = new Uri(conn.Server),
                UseDefaultCredentials = false,
                BypassProxyOnLocal = false,
                Credentials = new NetworkCredential(
                    userName: conn.User,
                    password: CryptHelper.Decryptor(conn.SecuredData))
            };
            return proxy;
        }

        private static bool IsDharmaConnection(string? connectionName, out string realName) {
            if (connectionName != null) {
                if (connectionName.EndsWith("@dharma", true, CultureInfo.InvariantCulture)) {
                    realName = connectionName.Split('@').First();
                    return true;
                }
            }
            realName = connectionName ?? string.Empty;
            return false;
        }
    }
}
