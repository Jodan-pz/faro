using System;
using System.Collections.Generic;
using System.Linq;

using FARO.Common;
using FARO.Common.Domain;
using FARO.Common.Helpers;

namespace FARO.Services {
    public class DefinitionSupportService : IDefinitionSupportService {
        readonly IEngineFactory _engineFactory;
        readonly IDefinitionDataService _definitionDataService;
        readonly IIntegrityCheckService _integrityCheckService;

        public DefinitionSupportService(IEngineFactory engineFactory, IDefinitionDataService definitionDataService, IIntegrityCheckService integrityCheckService) {
            _engineFactory = engineFactory ?? throw new ArgumentNullException(nameof(engineFactory));
            _definitionDataService = definitionDataService ?? throw new ArgumentNullException(nameof(definitionDataService));
            _integrityCheckService = integrityCheckService ?? throw new ArgumentNullException(nameof(integrityCheckService));
        }

        /// <summary>
        /// Retrieve all arguments values (with definition) needed by an image
        /// </summary>
        /// <param name="image">Image definition</param>
        /// <returns>Enumeration of argument values needed by the image parameter</returns>
        public IEnumerable<ArgumentValue> GetImageArguments(ImageDefinition image) {
            var args = new List<ArgumentValue>();
            var includedArgs = new HashSet<string>();
            if (image.KeysIterators != null) {
                foreach (var key in image.KeysIterators) {
                    var keyIterDef = _definitionDataService.GetKeysIterator(key.KeyId);
                    if (keyIterDef == null) continue;
                    var keyIter = _engineFactory.CreateKeysIterator(KeysIteratorScopedDefinition.Create(keyIterDef, key));
                    var keyArgs = keyIterDef.Arguments;
                    if (keyArgs != null) {
                        foreach (var arg in keyArgs) {
                            var argumentSelector = keyIter.GetArgumentName(arg.Name);
                            if (!includedArgs.Contains(argumentSelector)) {
                                args.Add(new ArgumentValue(argumentSelector, arg.Description, arg.Optional));
                                includedArgs.Add(argumentSelector);
                            }
                        }
                        if (keyIterDef.Fields != null) {
                            foreach (var field in keyIterDef.Fields) includedArgs.Add(keyIter.GetOutputFieldName(field.Name));
                        }
                    }
                }
            }
            return args;
        }

        /// <summary>
        /// Retrieve all the output fields of an image
        /// </summary>
        /// <param name="imageId">Image identifier</param>
        /// <returns>Enumeration of field names</returns>
        public IEnumerable<string> GetImageOutputFields(string imageId) {
            var outputFields = new HashSet<string>();
            var image = _definitionDataService.GetImage(imageId) ?? throw new NullReferenceException($"Image id: {imageId} not found!");
            if (image.KeysIterators != null) {
                foreach (var ki in image.KeysIterators) {
                    var kiDef = _definitionDataService.GetKeysIterator(ki.KeyId) ?? throw new NullReferenceException($"Keys iterator id: {ki} not found!");
                    var keysIterator = _engineFactory.CreateKeysIterator(KeysIteratorScopedDefinition.Create(kiDef, ki.Arguments, ki.Fields));
                    if (kiDef.Arguments != null) {
                        foreach (var kiDefArgName in kiDef.Arguments.Select(a => a.Name)) {
                            outputFields.Add(PrefixHelper.KeyName(keysIterator.GetArgumentName(kiDefArgName)));
                        }
                    }
                    if (kiDef.Fields != null) {
                        foreach (var kiDefOutFieldName in kiDef.Fields) {
                            var kiOutField = keysIterator.GetOutputFieldName(kiDefOutFieldName.Name);
                            outputFields.Add(PrefixHelper.KeyName(kiOutField));
                        }
                    }
                }
            }
            if (image.Layers != null) {
                foreach (var layer in image.Layers)
                    foreach (var item in layer.Items)
                        outputFields.Add(item.Field);
            }
            return outputFields.OrderBy(field => field);
        }

        /// <summary>
        /// Retrieve decorator usage information
        /// </summary>
        /// <param name="id">Decorator identifier</param>
        /// <returns>A collection of usage information for requested decorator id</returns>
        public DecoratorUsageCollection GetDecoratorUsage(string id) {
            var decorator = _definitionDataService.GetDecorator(id) ?? throw new NullReferenceException($"Cannot find decorator with id: {id}");
            var ret = new DecoratorUsageCollection
            {
                Subject = ObjectDefinitionDescriptor.Create(decorator)
            };
            var imagesByDecorator = _definitionDataService.ListImagesByDecorator(id);
            if (imagesByDecorator == null) return ret;
            foreach (var image in imagesByDecorator) {
                var fields = new List<string>();
                var allItems = image.Layers?.Select(l => l.Items);
                if (allItems == null) continue;
                foreach (var layerItem in allItems) {
                    foreach (var layerItemDef in layerItem) {
                        var fieldConfig = layerItemDef.Config;
                        if (layerItemDef.Field == null || fieldConfig == null) continue;
                        string decId = null;
                        if (fieldConfig is string) {
                            if (PrefixHelper.IsDecoratorName(fieldConfig, out string decoratorName)) {
                                decId = decoratorName.Split('.')[0];
                            }
                        } else {
                            if (fieldConfig.decorator != null &&
                                fieldConfig.decorator.Value is string) {
                                decId = fieldConfig.decorator.Value.ToString().Split('.')[0];
                            }
                        }
                        if (decId == id) fields.Add(layerItemDef.Field);
                    }
                }
                if (!fields.Any()) continue;
                ret.Add(new DecoratorUsageItem
                {
                    Image = ObjectDefinitionDescriptor.Create(image),
                    Flows = _definitionDataService.ListFlowItemsByImage(image.Id)?
                                                  .Select(ObjectDefinitionDescriptor.Create),
                    Fields = fields
                });
            }

            return ret;
        }

        /// <summary>
        /// Retrieve keys iterator usage information
        /// </summary>
        /// <param name="id">Keys Iterator identifier</param>
        /// <returns>A collection of usage information for requested keys iterator id</returns>
        public KeysIteratorUsageCollection GetKeysIteratorUsage(string id) {
            var keysIterator = _definitionDataService.GetKeysIterator(id) ?? throw new NullReferenceException($"Cannot find keys iterator with id: {id}");
            var ret = new KeysIteratorUsageCollection
            {
                Subject = ObjectDefinitionDescriptor.Create(keysIterator)
            };
            var images = _definitionDataService.ListImagesByKeysIterator(id);
            if (images == null) return ret;
            foreach (var img in images) {
                ret.Add(new KeysIteratorUsageItem
                {
                    Image = ObjectDefinitionDescriptor.Create(img),
                    Flows = _definitionDataService.ListFlowItemsByImage(img.Id)?
                                                  .Select(ObjectDefinitionDescriptor.Create),
                    Keys = img.KeysIterators.Select(k => ObjectDefinitionDescriptor.Create(_definitionDataService.GetKeysIterator(k.KeyId)))
                });
            }
            return ret;
        }

        /// <summary>
        /// Retrieve image usage information
        /// </summary>
        /// <param name="id">Image identifier</param>
        /// <returns>A collection of usage information for requested image id</returns>
        public ImageUsageCollection GetImageUsage(string id) {
            var image = _definitionDataService.GetImage(id) ?? throw new NullReferenceException($"Cannot find image with id: {id}");
            var flows = _definitionDataService.ListFlowItemsByImage(id)?
                                              .Select(ObjectDefinitionDescriptor.Create);
            var ret = new ImageUsageCollection
            {
                Subject = ObjectDefinitionDescriptor.Create(image)
            };
            ret.AddAll(new ImageUsageItem[] { new ImageUsageItem { Flows = flows } });
            return ret;
        }

        /// <summary>
        /// Retrieve validaor usage information
        /// </summary>
        /// <param name="id">Validator identifier</param>
        /// <returns>A collection of usage information for requested validator id</returns>
        public ValidatorUsageCollection GetValidatorUsage(string id) {
            var validator = _definitionDataService.GetValidator(id) ?? throw new NullReferenceException($"Cannot find validator with id: {id}");
            var flows = _definitionDataService.ListFlowItemsByValidator(id);
            var ret = new ValidatorUsageCollection
            {
                Subject = ObjectDefinitionDescriptor.Create(validator)
            };
            foreach (var flow in flows) {
                ret.AddAll(new ValidatorUsageItem[] {
                    new() {
                        Flows = new ObjectDefinitionDescriptor[]{ObjectDefinitionDescriptor.Create(flow)},
                        Validators = new ObjectDefinitionDescriptor[]{ObjectDefinitionDescriptor.Create(_definitionDataService.GetValidator(flow.ValidatorId)) }
                    }});
            }
            return ret;
        }

        /// <summary>
        /// Retrieve aggregator usage information
        /// </summary>
        /// <param name="id">Aggregator identifier</param>
        /// <returns>A collection of usage information for requested aggregtor id</returns>
        public AggregatorUsageCollection GetAggregatorUsage(string id) {
            var aggregator = _definitionDataService.GetAggregator(id) ?? throw new NullReferenceException($"Cannot find aggregator with id: {id}");
            var flows = _definitionDataService.ListFlowItemsByAggregator(id)?
                                              .Select(ObjectDefinitionDescriptor.Create);
            var ret = new AggregatorUsageCollection
            {
                Subject = ObjectDefinitionDescriptor.Create(aggregator)
            };
            ret.AddAll(new AggregatorUsageItem[] { new AggregatorUsageItem { Flows = flows } });
            return ret;
        }

        /// <summary>
        /// Retrieve writer usage information
        /// </summary>
        /// <param name="id">Writer identifier</param>
        /// <returns>A collection of usage information for requested writer id</returns>
        public WriterUsageCollection GetWriterUsage(string id) {
            var writer = _definitionDataService.GetWriter(id) ?? throw new NullReferenceException($"Cannot find writer with id: {id}");
            var flows = _definitionDataService.ListFlowItemsByWriter(id);
            var ret = new WriterUsageCollection
            {
                Subject = ObjectDefinitionDescriptor.Create(writer)
            };
            foreach (var flow in flows) {
                ret.AddAll(new WriterUsageItem[] {
                    new() {
                        Flows = new ObjectDefinitionDescriptor[]{ObjectDefinitionDescriptor.Create(flow)},
                        Writers = new ObjectDefinitionDescriptor[]{ObjectDefinitionDescriptor.Create(_definitionDataService.GetWriter(flow.WriterId)) }
                    }});
            }
            return ret;
        }

        public IEnumerable<ValidatorDefinition> ListImageCompatibleValidators(string imageId) {
            var (checker, _) = _integrityCheckService.CreateChecker(imageId);
            foreach (var valDef in _definitionDataService.ListValidators()) {
                if (!checker(valDef.Id).HasErrors) {
                    yield return valDef;
                }
            }
        }

        public IEnumerable<WriterDefinition> ListImageCompatibleWriters(string imageId, string aggregatorId = null) {
            var (_, checker) = _integrityCheckService.CreateChecker(imageId, aggregatorId);
            foreach (var wriDef in _definitionDataService.ListWriters()) {
                if (!checker(wriDef.Id).HasErrors) {
                    yield return wriDef;
                }
            }
        }
    }
}
