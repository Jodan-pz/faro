using System;
using System.Collections.Generic;
using System.IO;

using FARO.Common;
using FARO.Common.Domain;
using FARO.Common.Exceptions;
using Newtonsoft.Json;

namespace FARO.Services {
    public class JsonFlowConfigurationReader : IFlowConfigurationReader {
        readonly IFlowElementFactory _elementFactory;
        public JsonFlowConfigurationReader(IFlowElementFactory elementFactory) {
            _elementFactory = elementFactory ?? throw new ArgumentNullException(nameof(elementFactory));
        }

        public FlowConfiguration Read(FileInfo configuration) => Read(File.ReadAllText(configuration.FullName));

        public FlowConfiguration Read(string configuration) {
            dynamic currentConfig = JsonConvert.DeserializeObject(configuration);

            var keysIteratorDefinitions = new Dictionary<string, KeysIteratorDefinition>();
            var decoratorDefinitions = new Dictionary<string, DecoratorDefinition>();

            // add images
            var images = new Dictionary<string, dynamic>();
            foreach (var img in currentConfig.images) images.Add(img.Name, img);

            // add key-iterators
            foreach (var keyIter in currentConfig.keys) {
                string keyIteratorType = keyIter.Value.source.type.Value;
                var keysIteratorDefinition = new KeysIteratorDefinition();
                keysIteratorDefinition.Id = keysIteratorDefinition.Name = keyIter.Name;
                keysIteratorDefinition.Arguments = keyIter.Value.args?.ToObject<Argument[]>();
                keysIteratorDefinition.Fields = keyIter.Value.fields.ToObject<OutputField[]>();
                keysIteratorDefinition.Source = new KeysIteratorSourceDefinition
                {
                    Type = keyIteratorType,
                    Arguments = keyIter.Value.source.args.ToObject<IDictionary<string, string>>()
                };
                keysIteratorDefinitions.Add(keyIter.Name, keysIteratorDefinition);
            }

            // add decorators
            foreach (var dec in currentConfig.decorators) {
                string decoratorType = dec.Value.source.type.Value;
                var decoratorDefinition = new DecoratorDefinition
                {
                    Id = dec.Name,
                    Arguments = dec.Value.args?.ToObject<Argument[]>(),
                    Fields = dec.Value.fields?.ToObject<OutputField[]>(),
                    Source = new DecoratorSourceDefinition
                    {
                        Type = decoratorType,
                        Arguments = dec.Value.source.args.ToObject<IDictionary<string, string>>()
                    }
                };
                decoratorDefinitions.Add(dec.Name, decoratorDefinition);
            }

            var ret = new FlowConfiguration();
            foreach (var flowItem in currentConfig.flows) {
                var itemDef = new FlowItemDefinition();
                itemDef.Id = itemDef.Name = flowItem.Name;

                string imageId = flowItem.Value.image.Value;
                if (!images.ContainsKey(imageId)) throw new FlowItemException($"Cannot find image with name: {imageId}!");

                var imgConfig = images[imageId];
                var item = new FlowItem(itemDef)
                {
                    Image = _elementFactory.CreateImage(GetImageDefinition(imageId, imgConfig),
                                                        keysIteratorDefinitions,
                                                        decoratorDefinitions)
                };
                itemDef.ImageId = flowItem.Value.image.Value;

                string validorId = flowItem.Value.validator?.Value;
                itemDef.ValidatorId = validorId;
                if (validorId != null) {
                    var validatorValue = currentConfig.validators[validorId];
                    if (validatorValue != null) {
                        ValidatorDefinition validatorDefinition = validatorValue.ToObject<ValidatorDefinition>();
                        validatorDefinition.Name = validatorDefinition.Id = validorId;
                        item.Validator = _elementFactory.Engined.CreateValidator(validatorDefinition);
                    }
                }

                string aggregatorId = flowItem.Value.aggregator?.Value;
                itemDef.AggregatorId = aggregatorId;
                if (aggregatorId != null) {
                    var aggregatorValue = currentConfig.aggregators[aggregatorId];
                    if (aggregatorValue != null) {
                        if (aggregatorValue.image.Value != item.Image.Definition.Id) throw new FlowItemException($"Aggregator image mismatch! Found {aggregatorValue.image}, needed {item.Image.Definition.Id}");
                        var aggregatorDefinition = aggregatorValue.ToObject<AggregatorDefinition>();
                        aggregatorDefinition.Name = aggregatorDefinition.Id = aggregatorId;
                        item.Aggregator = _elementFactory.Engined.CreateAggregator(aggregatorDefinition);
                    }
                }

                string writerId = flowItem.Value.writer?.Value;
                itemDef.WriterId = writerId;
                if (writerId != null) {
                    var writerValue = currentConfig.writers[writerId];
                    if (writerValue != null) {
                        var writerDefinition = writerValue.ToObject<WriterDefinition>();
                        writerDefinition.Name = writerDefinition.Id = writerId;
                        item.Writer = _elementFactory.Engined.CreateWriter(writerDefinition);
                    }
                }
                ret.AddFlowItem(item);
            }
            return ret;
        }

        static ImageDefinition GetImageDefinition(string imageName, dynamic imgConfig) {
            var ret = new ImageDefinition();
            ret.Id = ret.Name = imageName;
            ret.KeysIterators = imgConfig.Value.keys.ToObject<ImageKeysIteratorsDefinition[]>();
            var layers = new List<LayerDefinition>();

            foreach (var layer in imgConfig.Value.layers) {
                var layerDef = new LayerDefinition
                {
                    Name = layer.Name,
                    Items = layer.Value.ToObject<LayerFieldItemDefinition[]>()
                };
                layers.Add(layerDef);
            }
            ret.Layers = layers;
            return ret;
        }
    }
}
