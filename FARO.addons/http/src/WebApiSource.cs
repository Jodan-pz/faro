using FARO.Common;
using FARO.Common.Domain;

namespace FARO.Addons.Http {
    public class WebApiSource : IDecoratorSource, IKeysIteratorSource {
        const string ARG_CONNECTION = "connection";
        const string ARG_METHOD = "method";
        const string ARG_QUERY_STRING = "qs";
        const string ARG_ACTION = "action";
        const string ARG_PROXY = "proxy";
        const string ARG_HEADERS = "headers";
        const string ARG_JSON_PATH = "jsonpath";

        public string? Connection { get; private set; }
        public string? Method { get; private set; }
        public string? QueryString { get; private set; }
        public string? Action { get; private set; }
        public string? Proxy { get; private set; }
        public string? Headers { get; private set; }
        public string? JsonPath { get; private set; }

        readonly Argument[] _arguments = {
                                          new Argument{ Name=ARG_CONNECTION, Description= "Connection name", Optional=false},
                                          new Argument{ Name=ARG_METHOD, Description ="Metbod name"},
                                          new Argument{ Name=ARG_QUERY_STRING, Description = "Query string"},
                                          new Argument{ Name=ARG_ACTION, Description = "Action name" },
                                          new Argument{ Name=ARG_PROXY, Description = "Proxy" },
                                          new Argument{ Name=ARG_HEADERS, Description = "Request default headers"},
                                          new Argument{ Name=ARG_JSON_PATH, Description = "Optional json path selector"}
                                          };

        public IEnumerable<Argument> Arguments => _arguments;
        public static WebApiSource CreateFromDefinition(SourceDefinition source) {
            var conn = source.Arguments[ARG_CONNECTION];
            var proxy = source.Arguments.ContainsKey(ARG_PROXY) ? source.Arguments[ARG_PROXY] : null;
            var headers = source.Arguments.ContainsKey(ARG_HEADERS) ? source.Arguments[ARG_HEADERS] : null;
            var jsonpath = source.Arguments.ContainsKey(ARG_JSON_PATH) ? source.Arguments[ARG_JSON_PATH] : null;
            var qs = source.Arguments.ContainsKey(ARG_QUERY_STRING) ? source.Arguments[ARG_QUERY_STRING] : null;
            return new WebApiSource
            {
                Connection = conn,
                Method = source.Arguments[ARG_METHOD],
                QueryString = qs,
                Action = source.Arguments[ARG_ACTION],
                Headers = headers,
                Proxy = proxy,
                JsonPath = jsonpath
            };
        }
    }
}
