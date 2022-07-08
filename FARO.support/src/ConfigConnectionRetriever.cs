using System.Net;

using FARO.Common;

namespace FARO.Support {

    public class ConfigConnectionRetriever : IConnectionRetriever {
        public string GetConnectionString(string connection) => connection;
        public IWebProxy GetProxyConnection(string connection) => new WebProxy(connection);
        public string GetServer(string connection) => connection;
    }
}