
using FARO.Common;
using FARO.Common.Domain;

namespace FARO.Addons.File.KeysIterators {

    public class FileSystemEntrySource : IKeysIteratorSource {
        const string DEFAULT_WILDCARD = "*.*";
        const string ARG_PATH = "path";
        const string ARG_WILDCARD = "wildcard";
        const string ARG_DEEP = "deep";

        readonly Argument[] _arguments = {
                new Argument{ Name=ARG_PATH, Description= "Path"},
                new Argument{ Name=ARG_WILDCARD, Description= "File wildcard pattern"},
                new Argument{ Name=ARG_DEEP, Description ="Navigate nested files"}
        };

        public string? Path { get; private set; }
        public string? Wildcard { get; private set; }
        public string? Deep { get; private set; }

        public static FileSystemEntrySource CreateFromDefinition(SourceDefinition source) {
            return new FileSystemEntrySource
            {
                Path = source.Arguments.ContainsKey(ARG_PATH) ? source.Arguments[ARG_PATH] : string.Empty,
                Wildcard = source.Arguments.ContainsKey(ARG_WILDCARD) ? source.Arguments[ARG_WILDCARD] : DEFAULT_WILDCARD,
                Deep = source.Arguments.ContainsKey(ARG_DEEP) ? source.Arguments[ARG_DEEP] : bool.FalseString,
            };
        }
        public IEnumerable<Argument> Arguments => _arguments;
    }
}