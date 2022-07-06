using System;
using System.IO;

using FARO.Common;

namespace FARO.Services {
    public class DataResourceService : IDataResourceService {
        private readonly string _rootDataPath;

        public DataResourceService(string rootDataPath) {
            _rootDataPath = rootDataPath ?? Environment.GetFolderPath(Environment.SpecialFolder.Personal);
        }

        public bool ExistResource(string resourceName) {
            return InternalExistResource(resourceName) ||
                   InternalExistResource(Path.Combine(_rootDataPath, resourceName));
        }

        public string GetResourcePath(string resourceName) {
            if (InternalExistResource(resourceName)) return resourceName;
            return Path.Combine(_rootDataPath, resourceName);
        }

        public override string ToString() {
            return _rootDataPath;
        }

        private static bool InternalExistResource(string resourceName) => File.Exists(resourceName) ||
                                                                          Directory.Exists(resourceName);

    }
}
