using FARO.Common;
using FARO.Common.Domain;

namespace FARO.Addons.File {
    public class DelimitedSource : IKeysIteratorSource, IDecoratorSource {
        const char DEFAULT_DELIM_CHAR = ',';
        const string ARG_PATH = "path";
        const string ARG_SEARCH_PATH = "searchpath";
        const string ARG_WHERE = "where";
        const string ARG_DELIM = "delim";
        const string ARG_ENCODING = "encoding";
        const string ARG_SKIP_HEADER = "skipheader";
        const string ARG_FIELDS = "fields";

        readonly Argument[] _arguments = {
                                          new Argument{ Name=ARG_PATH, Description= "Path"},
                                          new Argument{ Name=ARG_SEARCH_PATH, Description= "File search pattern"},
                                          new Argument{ Name=ARG_WHERE, Description ="Rows selector"},
                                          new Argument{ Name=ARG_DELIM, Description ="Delimiter"},
                                          new Argument{ Name=ARG_ENCODING, Description ="Encoding"},
                                          new Argument{ Name=ARG_SKIP_HEADER, Description ="Skip header flag"},
                                          new Argument{ Name=ARG_FIELDS, Description ="List of fields"}
                                          };
        public string? Path { get; private set; }
        public string? SearchPath { get; private set; }
        public string? Where { get; private set; }
        public char Delim { get; private set; }
        public string? Encoding { get; private set; }
        public bool? SkipHeader { get; private set; }
        public IEnumerable<string>? Fields { get; private set; }

        public static DelimitedSource CreateFromDefinition(SourceDefinition source) {
            var sourceFields = source.Arguments.ContainsKey(ARG_FIELDS) ? source.Arguments[ARG_FIELDS] ?? string.Empty : null;
            IEnumerable<string>? fields = null;
            if (sourceFields?.Contains('-') ?? false) {
                var range = sourceFields.Split('-');
                try {
                    fields = Enumerable.Range(int.Parse(range.First()), int.Parse(range.Last()))
                                       .Select(fieldNum => fieldNum.ToString());
                } catch (FormatException) {
                    throw new ArgumentException("Fields range must be numbers! Ex (start-count): 1-5 or 4-10 ");
                }
            } else {
                fields = sourceFields?.Split(DEFAULT_DELIM_CHAR).Select(field => field.Trim());
            }

            return new DelimitedSource
            {
                Path = source.Arguments[ARG_PATH],
                SearchPath = source.Arguments[ARG_SEARCH_PATH],
                Where = source.Arguments.ContainsKey(ARG_WHERE) ? source.Arguments[ARG_WHERE] : null,
                Delim = (source.Arguments.ContainsKey(ARG_DELIM) ? source.Arguments[ARG_DELIM]?.First() : null) ?? DEFAULT_DELIM_CHAR,
                Encoding = source.Arguments.ContainsKey(ARG_ENCODING) ? source.Arguments[ARG_ENCODING] : null,
                SkipHeader = source.Arguments.ContainsKey(ARG_SKIP_HEADER) && bool.Parse(source.Arguments[ARG_SKIP_HEADER]),
                Fields = fields
            };
        }

        public IEnumerable<Argument> Arguments => _arguments;
    }
}
