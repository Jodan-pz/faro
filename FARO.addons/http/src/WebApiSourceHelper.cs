using System.Net;
using FARO.Common;
using FARO.Common.Domain;

namespace FARO.Addons.Http {
    internal static class WebApiSourceHelper {

        internal static (string server,
                         string method,
                         string action,
                         string queryString,
                         HttpClientHandler httpClientHandler,
                         IDictionary<string, string> headers,
                         string? jsonPath) GetWebApiSourceConfig(SourceDefinition sourceDefinition, IConnectionRetriever? connectionRetriever = null) {

            var source = WebApiSource.CreateFromDefinition(sourceDefinition);
            var server = source.Connection ?? throw new NullReferenceException("Connection cannot be null!");
            if (connectionRetriever is not null) {
                server = connectionRetriever.GetServer(server) ?? throw new NullReferenceException($"Connection {server} not found!");
            }
            var proxy = source.Proxy;
            var httpClientHandler = new HttpClientHandler();
            if (proxy != null) {
                httpClientHandler.Proxy = connectionRetriever?.GetProxyConnection(proxy) ?? new WebProxy(proxy);
            }
            var method = source.Method ?? HttpMethod.Get.Method;
            var action = source.Action ?? string.Empty;
            var queryString = source.QueryString ?? string.Empty;
            IDictionary<string, string> headers = new Dictionary<string, string>();
            if (source.Headers != null) {
                foreach (var header in source.Headers.Split('|')) {
                    var headerKeyValue = header.Split(':');
                    headers.Add(headerKeyValue.First(), headerKeyValue.Last());
                }
            }
            var jsonPath = source.JsonPath;
            return (server, method, action, queryString, httpClientHandler, headers, jsonPath);
        }
    }
}
