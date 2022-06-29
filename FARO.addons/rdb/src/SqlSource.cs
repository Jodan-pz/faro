using FARO.Common;
using FARO.Common.Domain;

namespace FARO.Addons.Rdb {
    public class SqlSource : IDecoratorSource, IKeysIteratorSource {
        const string ARG_CONNECTION = "connection";
        const string ARG_BODY = "sqlBody";

        public string? Connection { get; private set; }
        public string? SqlBody { get; private set; }

        readonly Argument[] _arguments = {
                                          new Argument{ Name=ARG_CONNECTION, Description= "Connection name", Optional=false},
                                          new Argument{ Name=ARG_BODY, Description ="Sql Body", Optional=false}
                                          };

        public IEnumerable<Argument> Arguments => _arguments;

        public static SqlSource CreateFromDefinition(SourceDefinition source) {
            return new SqlSource
            {
                Connection = source.Arguments[ARG_CONNECTION],
                SqlBody = source.Arguments[ARG_BODY]
            };
        }
    }
}
