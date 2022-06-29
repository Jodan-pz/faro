using System;
using System.Collections.Generic;
using System.Text;
using FARO.Common;
using FARO.Common.Domain;
using FARO.Common.Helpers;

namespace FARO.Services {
    public class Layer : ILayer {
        public string Name { get; private set; }
        public IList<LayerFieldItem> Items { get; private set; }

        public static Layer Configure(LayerDefinition definition, IImageItemResolver decoratorResolver) {
            var ret = new Layer
            {
                Name = definition.Name,
                Items = new List<LayerFieldItem>()
            };
            foreach (var item in definition.Items) {
                var fieldConfig = item.Config;
                if (fieldConfig == null || fieldConfig is string || fieldConfig.GetType().IsPrimitive)
                    ret.Items.Add(new LayerFieldItem(ret, item.Field, decoratorResolver.ResolveDecorator(fieldConfig)));
                else {
                    if (fieldConfig.decorator != null) {
                        ret.Items.Add(
                            new LayerFieldItem(ret, item.Field,
                                               decoratorResolver.ResolveDecorator(PrefixHelper.DecoratorName(fieldConfig.decorator.Value),
                                                                                  fieldConfig.args.ToObject<IDictionary<string, object>>())
                            ));
                    } else {
                        throw new ApplicationException($"Cannot parse decorator for field name: {item.Field}");
                    }
                }
            }
            return ret;
        }

        public override string ToString() {
            var sb = new StringBuilder();
            sb.AppendLine($"Layer: {Name}").AppendLine();
            foreach (var item in Items) sb.AppendLine(item.ToString());
            return sb.ToString();
        }
    }
}
