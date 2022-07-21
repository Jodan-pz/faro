using System;
using System.Collections.Concurrent;
using FARO.Common;
using FARO.Common.Domain;

namespace FARO.Services {
    public class ImageWatcher : IImageWatcher {
        readonly ConcurrentDictionary<string, ConcurrentDictionary<string, ImageWatcherItem>> _decorators = new();

        public void Clear(ImageDefinition image) {
            _decorators.TryRemove(image.Id, out _);
        }

        static string GetItemKey(ILayer layer, IDecorator decorator) => $"{layer.Name}_{decorator.HashKey}";

        public ImageWatcherItem GetWatcherItem(ImageDefinition image, ILayer layer, IDecorator decorator) {
            if (_decorators.TryGetValue(image.Id, out var watchers)) {
                var itemKey = GetItemKey(layer, decorator);
                if (watchers.ContainsKey(itemKey) && watchers.TryGetValue(itemKey, out var result)) {
                    return result;
                }
            }
            return null;
        }

        public void SetField(ImageDefinition image, ILayer layer, IDecorator decorator, string fieldName) {
            if (_decorators.TryGetValue(image.Id, out var watchers)) {
                var itemKey = GetItemKey(layer, decorator);
                if (watchers.ContainsKey(itemKey) && watchers.TryGetValue(itemKey, out var result)) {
                    result.FieldName = fieldName;
                }
            }
        }

        public void StartDecorator(ImageDefinition image, ILayer layer, IDecorator decorator) {
            if (!_decorators.ContainsKey(image.Id)) _decorators.TryAdd(image.Id, new ConcurrentDictionary<string, ImageWatcherItem>());
            if (_decorators.TryGetValue(image.Id, out var watchers)) {
                var itemKey = GetItemKey(layer, decorator);
                if (watchers.ContainsKey(itemKey)) {
                    if (watchers.TryGetValue(itemKey, out var watcher)) {
                        watcher.Start = DateTime.UtcNow;
                    }
                } else {
                    watchers.TryAdd(itemKey, new ImageWatcherItem
                    {
                        Image = image,
                        Layer = layer,
                        Decorator = decorator,
                        Start = DateTime.UtcNow
                    });
                }
            }
        }

        public void StopDecorator(ImageDefinition image, ILayer layer, IDecorator decorator) {
            if (!_decorators.ContainsKey(image.Id)) return;
            if (_decorators.TryGetValue(image.Id, out var watchers)) {
                var itemKey = GetItemKey(layer, decorator);
                if (watchers.ContainsKey(itemKey) && watchers.TryGetValue(itemKey, out var watcher)) {
                    watcher.Stop = DateTime.UtcNow;
                }
            }
        }
    }
}
