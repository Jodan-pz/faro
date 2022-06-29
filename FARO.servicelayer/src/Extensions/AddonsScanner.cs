using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using FARO.Common;
using Microsoft.Extensions.DependencyInjection;
using YamlDotNet.Serialization;
using YamlDotNet.Serialization.NamingConventions;

namespace FARO.Extensions.DependencyInjection {

    public class AddonsConfiguration {

        public class EngineConfiguration {
            public string Id { get; set; }
            public string Assembly { get; set; }
            public string Engine { get; set; }
            public string Source { get; set; }
            [YamlMember(Alias = "webapi-scoped", ApplyNamingConventions = false)]
            public bool WebApiScoped { get; set; }
        }

        public class Item {
            public string Id { get; set; }
            public string Assembly { get; set; }
            public string RootNamespace { get; set; }
            public EngineConfiguration[] KeysIterators { get; set; }
            public EngineConfiguration[] Decorators { get; set; }
            public EngineConfiguration[] Aggregators { get; set; }
            public EngineConfiguration[] Validators { get; set; }
            public EngineConfiguration[] Writers { get; set; }
        }

        [YamlMember(Alias = "faro-addons", ApplyNamingConventions = false)]
        public Dictionary<string, Item>[] Addons { get; set; }
    }

    public static class AddonsScanner {

        public class ScannerActions {
            public Action<AddonsConfiguration.EngineConfiguration> KeyIterator { get; set; }
            public Action<AddonsConfiguration.EngineConfiguration> Decorator { get; set; }
            public Action<AddonsConfiguration.EngineConfiguration> Validator { get; set; }
            public Action<AddonsConfiguration.EngineConfiguration> Aggregator { get; set; }
            public Action<AddonsConfiguration.EngineConfiguration> Writer { get; set; }
        }

        public static IServiceCollection ScanAddons(this IServiceCollection services, AddonsConfig configuration, Action<ScannerActions> actions) {
            if (configuration.Paths == null) return services;
            var deserializer = new DeserializerBuilder()
                .WithNamingConvention(LowerCaseNamingConvention.Instance)
                .Build();
            var scactions = new ScannerActions();
            actions.Invoke(scactions);
            foreach (var path in configuration.Paths) {
                var di = new DirectoryInfo(path);
                if (!di.Exists) continue;
                foreach (var file in di.GetFiles("*.yaml")) {
                    using var yaml = file.OpenText();
                    var addons = deserializer.Deserialize<AddonsConfiguration>(yaml);
                    IterateAddons(scactions, addons);
                }
            }
            return services;
        }

        private static void IterateAddons(ScannerActions actions, AddonsConfiguration addons) {
            if (addons.Addons is null) return;
            foreach (var addonDic in addons.Addons) {
                foreach (var addon in addonDic) {
                    var defaultId = (addon.Value.Id ?? addon.Key).ToUpper();
                    var defaultAsm = addon.Value.Assembly;
                    var rootNs = addon.Value.RootNamespace;
                    NotifyEngine(defaultId, defaultAsm, rootNs, actions.KeyIterator, addon.Value.KeysIterators);
                    NotifyEngine(defaultId, defaultAsm, rootNs, actions.Decorator, addon.Value.Decorators);
                    NotifyEngine(defaultId, defaultAsm, rootNs, actions.Validator, addon.Value.Validators);
                    NotifyEngine(defaultId, defaultAsm, rootNs, actions.Aggregator, addon.Value.Aggregators);
                    NotifyEngine(defaultId, defaultAsm, rootNs, actions.Writer, addon.Value.Writers);
                }
            }
        }

        private static void NotifyEngine(string defaultId, string defaultAsm, string rootNamespace, Action<AddonsConfiguration.EngineConfiguration> action, AddonsConfiguration.EngineConfiguration[] items) {
            if (!(items?.Any() ?? false) || action == null) return;
            foreach (var item in items) {
                if (string.IsNullOrEmpty(item.Engine)) continue;
                var itemId = item.Id ?? defaultId;
                var itemAsm = item.Assembly ?? defaultAsm;
                var fullEngineName = rootNamespace is not null ? string.Concat(rootNamespace, '.', item.Engine) : item.Engine;
                var fullSourceName = rootNamespace is not null ? string.Concat(rootNamespace, '.', item.Source) : item.Source;
                // delegate registration
                action.Invoke(new AddonsConfiguration.EngineConfiguration
                {
                    Id = itemId,
                    Assembly = itemAsm,
                    Engine = fullEngineName,
                    Source = fullSourceName,
                    WebApiScoped = item.WebApiScoped
                });
            }
        }
    }
}
