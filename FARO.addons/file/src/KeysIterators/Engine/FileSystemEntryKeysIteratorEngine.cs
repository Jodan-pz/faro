
using FARO.Common;
using FARO.Common.Exceptions;

namespace FARO.Addons.File.KeysIterators.Engine {

    public class FileSystemEntryKeysIteratorEngine : IKeysIteratorEngine {

        const string DEFAULT_WILDCARD = "*.*";

        public IEnumerable<IDictionary<string, object>> GetKeys(IKeysIterator keysIterator, IDictionary<string, object> args, IDataResourceService dataResource) {
            var source = FileSystemEntrySource.CreateFromDefinition(keysIterator.Definition.Source);
            var path = source.Path;
            var wildcard = source.Wildcard;
            var deep = source.Deep;

            if (keysIterator.Definition.Arguments != null) {
                foreach (var arg in keysIterator.Definition.Arguments) {
                    var argSel = keysIterator.GetArgumentName(arg.Name);
                    var argValue = args.ContainsKey(argSel) ? args[argSel] : null;
                    if (!arg.Optional && argValue == null) throw new NullArgumentValueException(keysIterator, argSel != arg.Name ? $"{arg.Name} as {argSel}" : argSel, args);
                    if (path is not null)
                        path = path.Replace("{" + arg.Name + "}", argValue?.ToString() ?? string.Empty);
                    if (deep is not null)
                        deep = deep.Replace("{" + arg.Name + "}", argValue?.ToString() ?? string.Empty);
                }
            }

            if (!bool.TryParse(deep, out var searchDeep)) searchDeep = false;

            path = dataResource.GetResourcePath(path);
            var files = Directory.GetFileSystemEntries(path, wildcard ?? DEFAULT_WILDCARD, searchDeep ? SearchOption.AllDirectories : SearchOption.TopDirectoryOnly);

            foreach (var file in files) {
                yield return CreateResultRow(new FileInfo(file));
            }
        }

        private static Dictionary<string, object> CreateResultRow(FileInfo fileInfo) {
            var isFolder = (fileInfo.Attributes & FileAttributes.Directory) == FileAttributes.Directory;
            var fieldValues = new Dictionary<string, object>
            {
                { "Type", isFolder ? "DIR":""},
                { "FullName", fileInfo.FullName },
                { "Directory", fileInfo.DirectoryName ?? string.Empty },
                { "Created", fileInfo.CreationTimeUtc },
                { "LastAccess", fileInfo.LastAccessTimeUtc },
                { "LastWrite", fileInfo.LastWriteTimeUtc },
                { "Name", fileInfo.Name },
                { "Length", isFolder ? 0: fileInfo.Length }
            };
            return fieldValues;
        }
    }
}
