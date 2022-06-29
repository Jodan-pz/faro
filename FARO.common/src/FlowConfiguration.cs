using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using FARO.Common.Domain;

namespace FARO.Common {
    public class FlowConfiguration {
        IDictionary<string, object> _writerArgs;
        IDictionary<string, object> _imageArgs;
        int? _keysLimit = null;
        bool? _check = null;
        ImagePersisterOptions _persisterOptions = null;
        readonly List<FlowItem> _items = new();

        public void All(Action<FlowItem, IDictionary<string, object>, IDictionary<string, object>> action) => _items.ForEach(i => action(ConfigureItem(i), _imageArgs, _writerArgs));
        public void All(Action<FlowItem, IDictionary<string, object>, IDictionary<string, object>, int?> action) => _items.ForEach(i => action(ConfigureItem(i), _imageArgs, _writerArgs, _keysLimit));

        public void One(Action<FlowItem, IDictionary<string, object>, IDictionary<string, object>> action) => action(ConfigureItem(_items.SingleOrDefault()), _imageArgs, _writerArgs);
        public void One(Action<FlowItem, IDictionary<string, object>, IDictionary<string, object>, int?> action) => action(ConfigureItem(_items.SingleOrDefault()), _imageArgs, _writerArgs, _keysLimit);

        FlowItem ConfigureItem(FlowItem item) {
            if (item is not null) {
                item.RunOptions = new FlowItem.FlowRunOptions(_check ?? false, _persisterOptions);
            }
            return item;
        }

        public FlowConfiguration AddFlowItem(FlowItem item) {
            _items.Add(item);
            return this;
        }

        public FlowConfiguration WithKeysLimit(int limit) {
            _keysLimit = limit;
            return this;
        }

        public FlowConfiguration Checked(bool? check) {
            _check = check;
            return this;
        }

        public FlowConfiguration WithImagePersister(bool? enabled, string buildStep = null) {
            _persisterOptions = new ImagePersisterOptions { Enabled = enabled ?? false, BuildStep = buildStep };
            return this;
        }

        public FlowConfiguration WithArguments(IDictionary<string, object> imageArgs, IDictionary<string, object> writerArgs) {
            _imageArgs = imageArgs ?? new Dictionary<string, object>();
            _writerArgs = writerArgs ?? new Dictionary<string, object>();
            return this;
        }

        public FlowConfiguration WithArguments(IEnumerable<ArgumentValue> imageArgs, IEnumerable<ArgumentValue> writerArgs) {
            return WithArguments(
                imageArgs?.ToDictionary(k => k.Name, v => v.Value),
                writerArgs?.ToDictionary(k => k.Name, v => v.Value)
                );
        }

        public FlowConfiguration WithArguments(params object[] args) {
            var dicImageArgs = new Dictionary<string, object>();
            var dicWriterArgs = new Dictionary<string, object>();
            if (args != null) {
                foreach (var arg in args.Select(a => a.ToString())) {
                    var sepKeyValue = arg.IndexOf('=');
                    if (sepKeyValue == -1) continue;
                    var argArr = new string[] { arg[..sepKeyValue], arg[(sepKeyValue + 1)..] };
                    if (argArr[0].StartsWith("WRI_", true, CultureInfo.InvariantCulture))
                        dicWriterArgs.Add(argArr[0][4..], argArr[1]);
                    else
                        dicImageArgs.Add(argArr[0], argArr[1]);
                }
            }
            return WithArguments(dicImageArgs, dicWriterArgs);
        }
    }
}