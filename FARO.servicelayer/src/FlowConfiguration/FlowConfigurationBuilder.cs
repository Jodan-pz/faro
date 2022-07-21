using System;
using System.Collections.Generic;
using System.Linq;

using FARO.Common;
using FARO.Common.Domain;
using FARO.Common.Exceptions;
using static FARO.Common.Helpers.PrefixHelper;

namespace FARO.Services {
    public class FlowConfigurationBuilder : IFlowConfigurationBuilder {
        readonly IDefinitionDataService _definitionDataService;
        readonly IFlowElementFactory _elementFactory;

        public FlowConfigurationBuilder(IDefinitionDataService definitionDataService,
                                        IFlowElementFactory elementFactory) {
            _definitionDataService = definitionDataService ?? throw new ArgumentNullException(nameof(definitionDataService));
            _elementFactory = elementFactory ?? throw new ArgumentNullException(nameof(elementFactory));
        }

        public FlowConfiguration Build(string flowId = null, string flowName = null) {
            FlowItemDefinition flowItemDef = null;
            if (flowId != null) flowItemDef = _definitionDataService.GetFlowItem(flowId);
            if (flowItemDef == null && flowName != null) flowItemDef = _definitionDataService.GetFlowItemByName(flowName);
            return Build(flowItemDef);
        }

        public FlowConfiguration Build(params string[] flowItemIds) {
            var defs = new List<FlowItemDefinition>();
            foreach (var flowItemId in flowItemIds) defs.Add(_definitionDataService.GetFlowItem(flowItemId));
            return Build(defs.ToArray());
        }

        public FlowConfiguration Build(params FlowItemDefinition[] flowItemDefinitions) {
            var ret = new FlowConfiguration();
            foreach (var flowDefinition in flowItemDefinitions) {
                if (flowDefinition == null) continue;
                ret.AddFlowItem(BuildFlowItem(flowDefinition));
            }
            return ret;
        }

        public FlowConfiguration Build(ImageDefinition imageDefinition,
                                       ValidatorDefinition validatorDefinition = null,
                                       AggregatorDefinition aggregatorDefinition = null,
                                       WriterDefinition writerDefinition = null) {
            // create flow configuration for single image
            var ret = new FlowConfiguration();
            if (imageDefinition == null) return ret;
            var flowItemDef = new FlowItemDefinition
            {
                Id = $"FLOW_FOR_IMAGE_{imageDefinition.Id}",
            };
            flowItemDef.Description = flowItemDef.Name = $"Flow item for image: {imageDefinition.Name}";
            flowItemDef.ImageId = imageDefinition.Id;
            flowItemDef.AggregatorId = aggregatorDefinition?.Id;
            flowItemDef.ValidatorId = validatorDefinition?.Id;
            flowItemDef.WriterId = writerDefinition?.Id;
            ret.AddFlowItem(BuildFlowItem(flowItemDef));
            return ret;
        }

        FlowItem BuildFlowItem(FlowItemDefinition flowDefinition) {
            var keysIteratorDefinitions = new Dictionary<string, KeysIteratorDefinition>();
            var decoratorDefinitions = new Dictionary<string, DecoratorDefinition>();

            var item = new FlowItem(flowDefinition);
            if (flowDefinition.ImageId != null) {
                var imageDefinition = _definitionDataService.GetImage(flowDefinition.ImageId) ?? throw new FlowItemException($"Cannot find image with id: {flowDefinition.ImageId}");
                // add key-iterators
                foreach (var keyIter in imageDefinition.KeysIterators.Select(keyIter => keyIter.KeyId)) {
                    if (keysIteratorDefinitions.ContainsKey(keyIter)) continue;
                    var dataKey = _definitionDataService.GetKeysIterator(keyIter);
                    keysIteratorDefinitions.Add(keyIter, dataKey);
                }
                // add decorators
                var allItems = imageDefinition.Layers?.Select(l => l.Items);
                var decoratorsToInclude = new HashSet<string>();
                if (allItems != null) {
                    foreach (var layerItems in allItems) {
                        foreach (var fieldConfig in layerItems.Select(layerItem => layerItem.Config)) {
                            if (fieldConfig == null || fieldConfig.GetType().IsPrimitive) continue;
                            string toAdd = null;
                            if (fieldConfig is string) {
                                if (IsDecoratorName(fieldConfig, out string decoratorName)) toAdd = decoratorName.Split('.')[0];
                            } else {
                                if (fieldConfig.decorator != null && fieldConfig.decorator.Value is string) toAdd = fieldConfig.decorator.Value.ToString().Split('.')[0];
                            }
                            if (toAdd != null) decoratorsToInclude.Add(toAdd);
                        }
                    }
                }
                foreach (var dec in decoratorsToInclude) {
                    var decorator = _definitionDataService.GetDecorator(dec);
                    decoratorDefinitions.Add(decorator.Id, decorator);
                }

                item.Image = _elementFactory.CreateImage(imageDefinition,
                                                         keysIteratorDefinitions,
                                                         decoratorDefinitions);
            }

            if (flowDefinition.ValidatorId != null) {
                var validatorDef = _definitionDataService.GetValidator(flowDefinition.ValidatorId) ?? throw new NullReferenceException($"Cannot find validator with id: {flowDefinition.ValidatorId}");
                item.Validator = _elementFactory.Engined.CreateValidator(validatorDef);
            }

            if (flowDefinition.AggregatorId != null) {
                var aggregatorDef = _definitionDataService.GetAggregator(flowDefinition.AggregatorId) ?? throw new NullReferenceException($"Cannot find aggregator with id: {flowDefinition.AggregatorId}");
                if (aggregatorDef.ImageId != item.Image.Definition.Id) throw new FlowItemException($"Aggregator image mismatch! Found {aggregatorDef.ImageId}, needed {item.Image.Definition.Id}");
                item.Aggregator = _elementFactory.Engined.CreateAggregator(aggregatorDef);
            }

            if (flowDefinition.WriterId != null) {
                var writerDef = _definitionDataService.GetWriter(flowDefinition.WriterId) ?? throw new NullReferenceException($"Cannot find writer with id: {flowDefinition.WriterId}");
                item.Writer = _elementFactory.Engined.CreateWriter(writerDef);
            }

            return item;
        }
    }
}
