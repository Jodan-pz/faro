using System.Net;

namespace FARO.Common {
    public interface IConnectionRetriever {
        string GetConnectionString(string connection);
        string GetServer(string connection);
        IWebProxy GetProxyConnection(string connection);
    }
}
