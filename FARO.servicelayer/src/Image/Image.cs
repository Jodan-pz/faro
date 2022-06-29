using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using FARO.Common;
using FARO.Common.Domain;
using FARO.Common.Exceptions;
using FARO.Common.Helpers;

namespace FARO.Services {

    public class Image : IImage {
        readonly ImageDefinition _definition;
        readonly IImageItemResolver _itemResolver;
        private readonly IExpressionEvaluator _expressionEvaluator;
        readonly IImageWatcher _imageWatcher;
        List<IKeysIterator> KeysIterators { get; set; }
        List<ILayer> Layers { get; set; }
        Dictionary<string, IEnumerable<IDecorator>> LayersSourcedDecorators { get; set; }

        public Image(ImageDefinition config,
                     IImageItemResolver itemResolver,
                     IExpressionEvaluator expressionEvaluator,
                     IImageWatcher imageWatcher = null) {
            _definition = config ?? throw new ArgumentNullException(nameof(config));
            _itemResolver = itemResolver ?? throw new ArgumentNullException(nameof(itemResolver));
            _expressionEvaluator = expressionEvaluator ?? throw new ArgumentNullException(nameof(expressionEvaluator));
            _imageWatcher = imageWatcher;
        }

        public ImageDefinition Definition => _definition;
        public IImageItemResolver ItemResolver => _itemResolver;

        public Action<ImageWatcherItem> OnWatchItem { get; set; } = null;

        public void BuildSchema() {
            // keys iterators
            KeysIterators = _definition.KeysIterators?.Select(ki => _itemResolver.ResolveKeysIterator(ki) ?? throw new NullReferenceException($"Cannot resolve keys itarator with name: {ki}")).ToList();
            // layers
            Layers = null;
            LayersSourcedDecorators = null;
            if (_definition.Layers != null) {
                Layers = new();
                LayersSourcedDecorators = new();
                foreach (var layerDef in _definition.Layers) {
                    var configuredLayer = Layer.Configure(layerDef, _itemResolver) ?? throw new NullReferenceException($"Cannot properly configure layer: {layerDef.Name}");
                    Layers.Add(configuredLayer);
                    LayersSourcedDecorators.Add(configuredLayer.Name,
                                            configuredLayer.Items
                                            .Where(item => item.Decorator.Definition.Source != null)
                                            .Distinct(DecoratorHashKeyComparer.Instance)
                                            .Select(d => d.Decorator));
                }
            }
            _imageWatcher?.Clear(Definition);
        }

        public void IterateKeys(IDictionary<string, object> args, Action<IDictionary<string, object>> keyPredicate) => IterateKeys(args, (dic) => { keyPredicate(dic); return true; });

        public void IterateKeys(IDictionary<string, object> args, Func<IDictionary<string, object>, bool> keyPredicate) {
            if (!(KeysIterators?.Any() ?? false)) return;
            if (KeysIterators.Count > 5) throw new ApplicationException($"Found {KeysIterators.Count} iterators. Max number of nested iterators is 5!");
            var loop = true;
            KeysIterators[0].Iterate(args, k => {
                if (!loop) return false;
                if (KeysIterators.Count == 1) loop = keyPredicate(k);
                else KeysIterators[1].Iterate(k, k1 => {
                    if (!loop) return false;
                    if (KeysIterators.Count == 2) loop = keyPredicate(k1);
                    else KeysIterators[2].Iterate(k1, k2 => {
                        if (!loop) return false;
                        if (KeysIterators.Count == 3) loop = keyPredicate(k2);
                        else KeysIterators[3].Iterate(k2, k3 => {
                            if (!loop) return false;
                            if (KeysIterators.Count == 4) loop = keyPredicate(k3);
                            else KeysIterators[4].Iterate(k3, k4 => loop = keyPredicate(k4), 5);
                            return loop;
                        }
                        , 4);
                        return loop;
                    }, 3);
                    return loop;
                }, 2);
                return loop;
            });
        }

        public void EvalLayers(ImageOutputRow outputRow) {
            Layers?.ForEach(layer => {
                // get sourced decorators to call
                // make decorator run in parallel but do not use await in items loop (layer evaluation must by sync!)
                var decoratorResults = new ConcurrentDictionary<string, IDictionary<string, object>>();
                if (LayersSourcedDecorators.TryGetValue(layer.Name, out var decorators)) {
                    var po = new ParallelOptions();
                    ParallelHelper.ForEach(decorators, po, (dec) => {
                        if (OnWatchItem != null) _imageWatcher?.StartDecorator(Definition, layer, dec);
                        var evalVal = dec.GetValuesAsync(outputRow).GetAwaiter().GetResult();
                        decoratorResults.TryAdd(dec.HashKey, evalVal);
                        if (OnWatchItem != null) _imageWatcher?.StopDecorator(Definition, layer, dec);
                    }, (dec, ex) => new DecoratorException(dec, outputRow, layer, ex));
                }

                // map results (must be serial, updating -> image output)
                foreach (var item in layer.Items) {
                    try {
                        // iterate mappings and apply decorator results
                        var fieldName = item.Field;
                        object fieldValue = null;
                        var decKey = item.Decorator.HashKey;
                        if (decKey != null && decoratorResults.ContainsKey(decKey)) {
                            if (OnWatchItem != null) _imageWatcher?.SetField(Definition, layer, item.Decorator, fieldName);
                            // named decorator
                            var decResult = decoratorResults[decKey];
                            if (item.Decorator.Map != null) {
                                fieldValue = decResult[item.Decorator.Map];
                            } else {
                                fieldValue = decResult.First().Value;
                            }
                            OnWatchItem?.Invoke(_imageWatcher?.GetWatcherItem(Definition, layer, item.Decorator));
                        } else {
                            // unnamed "built-in" decorators (key/constant)
                            var specResult = item.Decorator.GetValuesAsync(outputRow).GetAwaiter().GetResult();
                            fieldValue = specResult[item.Decorator.Arguments.First().Name];
                        }
                        outputRow.SetValue(fieldName, fieldValue);
                    } catch (Exception ex) {
                        throw new DecoratorException(item.Decorator, outputRow, item, ex);
                    }
                }
                outputRow.LayerComplete(layer);
            });

            if (outputRow.Discard is null) {
                // check filter
                outputRow.Discard = !_expressionEvaluator.EvalCondition(Definition.Filter, outputRow);
                outputRow.RowComplete();
            }
        }

        public override string ToString() {
            var sb = new StringBuilder();
            // dump image infos.
            sb.AppendLine();
            sb.AppendLine(new string('-', 80));
            var keys = _definition.KeysIterators?.Aggregate("", (a, c) => a += c + " > ")
                                                 .TrimEnd(" > ".ToCharArray()) ?? "None";
            sb.AppendLine($"Image {_definition.Id} ({_definition.Name}), using iterators: {keys}");
            sb.AppendLine(new string('-', 80));
            sb.AppendLine("Layers");
            sb.AppendLine(new string('-', 80));
            if (Layers is null) {
                sb.AppendLine("None");
            } else {
                var layerCount = 0;
                foreach (var layer in Layers) sb.AppendLine(IndentLayer(layerCount++, layer.ToString()));
            }
            sb.AppendLine(new string('-', 80));
            return sb.ToString();
        }

        static string IndentLayer(int count, string layerLines) {
            if (count == 0) return layerLines;
            return layerLines.Split(new string[] { Environment.NewLine }, StringSplitOptions.None)
                    .Aggregate(string.Empty, (a, c) => a += new string(' ', count) + c + Environment.NewLine);
        }
    }
}