using System;
using System.IO;
using System.Reflection;
using System.Runtime.Loader;

namespace FARO.Common {
    public static class PathAssemblyResolver {
        public static void AddToCurrentDomain() {
            AppDomain.CurrentDomain.AssemblyResolve += OnResolve;
        }
        public static void RemoveFromCurrentDomain() {
            AppDomain.CurrentDomain.AssemblyResolve -= OnResolve;
        }
        private static Assembly OnResolve(object sender, ResolveEventArgs args) {
            var assemblyName = new AssemblyName(args.Name);
            var basePath = Path.GetDirectoryName(args.RequestingAssembly.Location);

            if (string.IsNullOrEmpty(basePath)) {
                return null;
            }

            foreach (var extension in new[] { ".dll", ".exe" }) {
                var path = Path.Combine(basePath, assemblyName.Name + extension);

                if (File.Exists(path)) {
                    try {
                        return AssemblyLoadContext.Default.LoadFromAssemblyPath(path);
                    } catch {
                    }
                }
            }
            return null;
        }



    }
}
