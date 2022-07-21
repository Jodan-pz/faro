using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

using FARO.Common;
using FARO.Common.Domain;
using FARO.Common.Exceptions;
using FARO.Common.Helpers;
using Newtonsoft.Json;

namespace FARO.Services {
    public class JsonFileDefinitionDataService : IDefinitionDataService {
        const string DATA_ROOT_FOLDER = "__faro__db__";
        const string DECORATORS_PREFIX = "dec_";
        const string KEYS_PREFIX = "keys_";
        const string IMAGES_PREFIX = "img_";
        const string WRITERS_PREFIX = "wri_";
        const string FLOW_ITEMS_PREFIX = "flw_";
        const string AGGREGATORS_PREFIX = "aggr_";
        const string VALIDATOR_PREFIX = "val_";
        readonly string _decoratorsPath;
        readonly string _keysIteratorsPath;
        readonly string _imagesPath;
        readonly string _writersPath;
        readonly string _flowItemsPath;
        readonly string _aggregatorsPath;
        readonly string _validatorsPath;

        public JsonFileDefinitionDataService(IAppSupport appSupport) {
            var rootPath = appSupport.JsonFileDefinitionDataRootPath;

            _decoratorsPath = Path.Combine(rootPath, DATA_ROOT_FOLDER, "decorators");
            _keysIteratorsPath = Path.Combine(rootPath, DATA_ROOT_FOLDER, "keysiterators");
            _imagesPath = Path.Combine(rootPath, DATA_ROOT_FOLDER, "images");
            _writersPath = Path.Combine(rootPath, DATA_ROOT_FOLDER, "writers");
            _flowItemsPath = Path.Combine(rootPath, DATA_ROOT_FOLDER, "flows");
            _aggregatorsPath = Path.Combine(rootPath, DATA_ROOT_FOLDER, "aggregators");
            _validatorsPath = Path.Combine(rootPath, DATA_ROOT_FOLDER, "validators");
            if (!Directory.Exists(_decoratorsPath)) Directory.CreateDirectory(_decoratorsPath);
            if (!Directory.Exists(_keysIteratorsPath)) Directory.CreateDirectory(_keysIteratorsPath);
            if (!Directory.Exists(_imagesPath)) Directory.CreateDirectory(_imagesPath);
            if (!Directory.Exists(_writersPath)) Directory.CreateDirectory(_writersPath);
            if (!Directory.Exists(_flowItemsPath)) Directory.CreateDirectory(_flowItemsPath);
            if (!Directory.Exists(_aggregatorsPath)) Directory.CreateDirectory(_aggregatorsPath);
            if (!Directory.Exists(_validatorsPath)) Directory.CreateDirectory(_validatorsPath);
        }

        #region  CRUD common impl.
        static string NewId() => Guid.NewGuid().ToString("N");

        static IEnumerable<T> ListObjects<T>(string rootPath, string prefix, int? pageIndex, int? pageSize) {
            foreach (var file in Directory.GetFiles(rootPath, $"{prefix}*.json").OrderBy(f => f).Paginate(pageIndex, pageSize)) {
                yield return JsonConvert.DeserializeObject<T>(File.ReadAllText(file));
            }
        }

        static T CreateObject<T>(dynamic objWithid, string itemScope, string rootPath, string prefix) {
            var fileToCreate = Path.Combine(rootPath, $"{prefix}{objWithid.Id}.json");
            if (File.Exists(fileToCreate)) throw new ApplicationException($"{itemScope ?? "Item"} already exists!");

            objWithid.Id = NewId();
            fileToCreate = Path.Combine(rootPath, $"{prefix}{objWithid.Id}.json");
            File.WriteAllText(fileToCreate, JsonConvert.SerializeObject(objWithid, Formatting.Indented));
            return objWithid;
        }

        static T ReadObject<T>(string id, string rootPath, string prefix) where T : class {
            var fileToGet = Path.Combine(rootPath, $"{prefix}{id}.json");
            if (!File.Exists(fileToGet)) return null;
            return JsonConvert.DeserializeObject<T>(File.ReadAllText(fileToGet));
        }

        static T UpdateObject<T>(string id, dynamic objWithId, string itemScope, string rootPath, string prefix) {
            var fileToUpdate = Path.Combine(rootPath, $"{prefix}{id}.json");
            if (!File.Exists(fileToUpdate)) throw new ApplicationException($"Missing {itemScope}. Cannot update decorator with id: {id}.");
            if (DeleteObject(id, rootPath, prefix)) {
                objWithId.Id = id;
                File.WriteAllText(fileToUpdate, JsonConvert.SerializeObject(objWithId, Formatting.Indented));
            }
            return objWithId;
        }

        static bool DeleteObject(string id, string rootPath, string prefix) {
            var fileToDelete = Path.Combine(rootPath, $"{prefix}{id}.json");
            if (!File.Exists(fileToDelete)) return false;
            try {
                File.Delete(fileToDelete);
            } catch { /* ignore errors */}
            return !File.Exists(fileToDelete);
        }
        #endregion

        public IEnumerable<DecoratorDefinition> ListDecorators(string filter = null,
                                                               FilterMatchMode filterMode = FilterMatchMode.Contains,
                                                               string[] tags = null,
                                                               TagsMatchMode tagsMatchMode = TagsMatchMode.Any,
                                                               int? pageIndex = null, int? pageSize = null) => ListObjects<DecoratorDefinition>(_decoratorsPath, DECORATORS_PREFIX, pageIndex, pageSize);
        public IEnumerable<KeysIteratorDefinition> ListKeysIterators(string filter = null,
                                                               FilterMatchMode filterMode = FilterMatchMode.Contains,
                                                               string[] tags = null,
                                                               TagsMatchMode tagsMatchMode = TagsMatchMode.Any,
                                                               int? pageIndex = null, int? pageSize = null) => ListObjects<KeysIteratorDefinition>(_keysIteratorsPath, KEYS_PREFIX, pageIndex, pageSize);
        public IEnumerable<ImageDefinition> ListImages(string filter = null,
                                                               FilterMatchMode filterMode = FilterMatchMode.Contains,
                                                               string[] tags = null,
                                                               TagsMatchMode tagsMatchMode = TagsMatchMode.Any,
                                                               int? pageIndex = null, int? pageSize = null) => ListObjects<ImageDefinition>(_imagesPath, IMAGES_PREFIX, pageIndex, pageSize);
        public IEnumerable<WriterDefinition> ListWriters(string filter = null,
                                                               FilterMatchMode filterMode = FilterMatchMode.Contains,
                                                               string[] tags = null,
                                                               TagsMatchMode tagsMatchMode = TagsMatchMode.Any,
                                                               int? pageIndex = null, int? pageSize = null) => ListObjects<WriterDefinition>(_writersPath, WRITERS_PREFIX, pageIndex, pageSize);
        public IEnumerable<FlowItemDefinition> ListFlowItems(string filter = null,
                                                               FilterMatchMode filterMode = FilterMatchMode.Contains,
                                                               string[] tags = null,
                                                               TagsMatchMode tagsMatchMode = TagsMatchMode.Any,
                                                               int? pageIndex = null, int? pageSize = null) => ListObjects<FlowItemDefinition>(_flowItemsPath, FLOW_ITEMS_PREFIX, pageIndex, pageSize);
        public IEnumerable<AggregatorDefinition> ListAggregators(string filter = null,
                                                               FilterMatchMode filterMode = FilterMatchMode.Contains,
                                                               string[] tags = null,
                                                               TagsMatchMode tagsMatchMode = TagsMatchMode.Any,
                                                               int? pageIndex = null, int? pageSize = null) => ListObjects<AggregatorDefinition>(_aggregatorsPath, AGGREGATORS_PREFIX, pageIndex, pageSize);
        public IEnumerable<ValidatorDefinition> ListValidators(string filter = null,
                                                               FilterMatchMode filterMode = FilterMatchMode.Contains,
                                                               string[] tags = null,
                                                               TagsMatchMode tagsMatchMode = TagsMatchMode.Any,
                                                               int? pageIndex = null, int? pageSize = null) => ListObjects<ValidatorDefinition>(_validatorsPath, VALIDATOR_PREFIX, pageIndex, pageSize);

        public DecoratorDefinition CreateDecorator(DecoratorDefinition decorator) => CreateObject<DecoratorDefinition>(decorator, "Decorator", _decoratorsPath, DECORATORS_PREFIX);
        public KeysIteratorDefinition CreateKeysIterator(KeysIteratorDefinition keysIterator) => CreateObject<KeysIteratorDefinition>(keysIterator, "Keys iterator", _keysIteratorsPath, KEYS_PREFIX);
        public ImageDefinition CreateImage(ImageDefinition image) => CreateObject<ImageDefinition>(image, "Image", _imagesPath, IMAGES_PREFIX);
        public WriterDefinition CreateWriter(WriterDefinition writer) => CreateObject<WriterDefinition>(writer, "Writer", _writersPath, WRITERS_PREFIX);
        public FlowItemDefinition CreateFlowItem(FlowItemDefinition flowItem) => CreateObject<FlowItemDefinition>(flowItem, "Flow Item", _flowItemsPath, FLOW_ITEMS_PREFIX);
        public AggregatorDefinition CreateAggregator(AggregatorDefinition aggregator) => CreateObject<AggregatorDefinition>(aggregator, "Aggregator", _aggregatorsPath, AGGREGATORS_PREFIX);
        public ValidatorDefinition CreateValidator(ValidatorDefinition validator) => CreateObject<ValidatorDefinition>(validator, "Validator", _validatorsPath, VALIDATOR_PREFIX);

        public IEnumerable<AggregatorDefinition> GetImageAggregators(string imageId) => ListObjects<AggregatorDefinition>(_aggregatorsPath, AGGREGATORS_PREFIX, null, null).Where(a => a.ImageId == imageId);

        public DecoratorDefinition GetDecorator(string id) => ReadObject<DecoratorDefinition>(id, _decoratorsPath, DECORATORS_PREFIX);
        public KeysIteratorDefinition GetKeysIterator(string id) => ReadObject<KeysIteratorDefinition>(id, _keysIteratorsPath, KEYS_PREFIX);
        public ImageDefinition GetImage(string id) => ReadObject<ImageDefinition>(id, _imagesPath, IMAGES_PREFIX);
        public WriterDefinition GetWriter(string id) => ReadObject<WriterDefinition>(id, _writersPath, WRITERS_PREFIX);
        public FlowItemDefinition GetFlowItemByName(string name) => ListObjects<FlowItemDefinition>(_flowItemsPath, FLOW_ITEMS_PREFIX, null, null).SingleOrDefault(f => f.Name == name);
        public FlowItemDefinition GetFlowItem(string id) => ReadObject<FlowItemDefinition>(id, _flowItemsPath, FLOW_ITEMS_PREFIX);
        public AggregatorDefinition GetAggregator(string id) => ReadObject<AggregatorDefinition>(id, _aggregatorsPath, AGGREGATORS_PREFIX);
        public ValidatorDefinition GetValidator(string id) => ReadObject<ValidatorDefinition>(id, _validatorsPath, VALIDATOR_PREFIX);

        public DecoratorDefinition UpdateDecorator(string id, DecoratorDefinition decorator) => UpdateObject<DecoratorDefinition>(id, decorator, "decorator", _decoratorsPath, DECORATORS_PREFIX);
        public KeysIteratorDefinition UpdateKeysIterator(string id, KeysIteratorDefinition keysIterator) => UpdateObject<KeysIteratorDefinition>(id, keysIterator, "keys iterator", _keysIteratorsPath, KEYS_PREFIX);
        public ImageDefinition UpdateImage(string id, ImageDefinition image) => UpdateObject<ImageDefinition>(id, image, "image", _imagesPath, IMAGES_PREFIX);
        public WriterDefinition UpdateWriter(string id, WriterDefinition writer) => UpdateObject<WriterDefinition>(id, writer, "writer", _writersPath, WRITERS_PREFIX);
        public FlowItemDefinition UpdateFlowItem(string id, FlowItemDefinition flowItem) => UpdateObject<FlowItemDefinition>(id, flowItem, "flow item", _flowItemsPath, FLOW_ITEMS_PREFIX);
        public AggregatorDefinition UpdateAggregator(string id, AggregatorDefinition aggregator) => UpdateObject<AggregatorDefinition>(id, aggregator, "aggregator", _aggregatorsPath, AGGREGATORS_PREFIX);
        public ValidatorDefinition UpdateValidator(string id, ValidatorDefinition validator) => UpdateObject<ValidatorDefinition>(id, validator, "validator", _validatorsPath, VALIDATOR_PREFIX);

        public bool DeleteDecorator(string id) => DeleteObject(id, _decoratorsPath, DECORATORS_PREFIX);
        public bool DeleteKeysIterator(string id) {
            var images = ListObjects<ImageDefinition>(_imagesPath, IMAGES_PREFIX, null, null).Where(image => image.KeysIterators != null && image.KeysIterators.Any(ki => ki.KeyId == id));
            if (images.Any()) throw new ObjectDefinitionException(id, images.Aggregate("Cannot delete keys iterator. These images are using it: ", (c, o) => c + $"'{o.Name}' ").Trim(' '));
            return DeleteObject(id, _keysIteratorsPath, KEYS_PREFIX);
        }
        public bool DeleteImage(string id) {
            var flows = ListObjects<FlowItemDefinition>(_flowItemsPath, FLOW_ITEMS_PREFIX, null, null).Where(a => a.ImageId == id);
            if (flows.Any()) throw new ObjectDefinitionException(id, flows.Aggregate("Cannot delete image. These flows are using it: ", (c, o) => c + $"'{o.Name}' ").Trim(' '));
            var ret = DeleteObject(id, _imagesPath, IMAGES_PREFIX);
            if (ret) {
                var aggregators = ListObjects<AggregatorDefinition>(_aggregatorsPath, AGGREGATORS_PREFIX, null, null).Where(a => a.ImageId == id);
                foreach (var aggregator in aggregators) DeleteAggregator(aggregator.Id);
            }
            return ret;
        }
        public bool DeleteWriter(string id) {
            var flows = ListObjects<FlowItemDefinition>(_flowItemsPath, FLOW_ITEMS_PREFIX, null, null).Where(a => a.WriterId == id);
            if (flows.Any()) throw new ObjectDefinitionException(id, flows.Aggregate("Cannot delete writer. These flows are using it: ", (c, o) => c + $"'{o.Name}' ").Trim(' '));
            return DeleteObject(id, _writersPath, WRITERS_PREFIX);
        }
        public bool DeleteFlowItem(string id) => DeleteObject(id, _flowItemsPath, FLOW_ITEMS_PREFIX);
        public bool DeleteAggregator(string id) {
            var flows = ListObjects<FlowItemDefinition>(_flowItemsPath, FLOW_ITEMS_PREFIX, null, null).Where(a => a.AggregatorId == id);
            if (flows.Any()) throw new ObjectDefinitionException(id, flows.Aggregate("Cannot delete aggregator. These flows are using it: ", (c, o) => c + $"'{o.Name}' ").Trim(' '));

            return DeleteObject(id, _aggregatorsPath, AGGREGATORS_PREFIX);
        }
        public bool DeleteValidator(string id) {
            var flows = ListObjects<FlowItemDefinition>(_flowItemsPath, FLOW_ITEMS_PREFIX, null, null).Where(a => a.ValidatorId == id);
            if (flows.Any()) throw new ObjectDefinitionException(id, flows.Aggregate("Cannot delete validator. These flows are using it: ", (c, o) => c + $"'{o.Name}' ").Trim(' '));

            return DeleteObject(id, _validatorsPath, VALIDATOR_PREFIX);
        }

        public IEnumerable<ImageDefinition> ListImagesByKeysIterator(string keysIteratorId, int? pageIndex = null, int? pageSize = null) {
            return ListObjects<ImageDefinition>(_imagesPath, IMAGES_PREFIX, null, null)
                   .Where(i => i.KeysIterators?.Any(o => o.KeyId == keysIteratorId) ?? false)
                   .OrderBy(f => f.Id)
                   .Paginate(pageIndex, pageSize);
        }

        public IEnumerable<ImageDefinition> ListImagesByDecorator(string decoratorId, int? pageIndex = null, int? pageSize = null) {
            var images = ListObjects<ImageDefinition>(_imagesPath, IMAGES_PREFIX, null, null);
            var ret = new List<ImageDefinition>();
            foreach (var image in images) {
                foreach (var layer in image.Layers) {
                    // very 'simple' full-text search implementation
                    var jsonString = JsonConvert.SerializeObject(layer);
                    if (jsonString.Contains(PrefixHelper.DecoratorName(decoratorId)) ||
                        jsonString.Contains($"\"decorator\":\"{decoratorId}")) {
                        ret.Add(image);
                        break;
                    }
                }
            }
            return ret.OrderBy(i => i.Id)
                      .Paginate(pageIndex, pageSize);
        }

        public IEnumerable<FlowItemDefinition> ListFlowItemsByImage(string imageId, int? pageIndex = null, int? pageSize = null) {
            return ListObjects<FlowItemDefinition>(_flowItemsPath, FLOW_ITEMS_PREFIX, null, null)
                  .Where(f => f.ImageId == imageId)
                  .OrderBy(f => f.Id)
                  .Paginate(pageIndex, pageSize);
        }

        public IEnumerable<FlowItemDefinition> ListFlowItemsByValidator(string validatorId, int? pageIndex = null, int? pageSize = null) {
            return ListObjects<FlowItemDefinition>(_flowItemsPath, FLOW_ITEMS_PREFIX, null, null)
                  .Where(f => f.ValidatorId == validatorId)
                  .OrderBy(f => f.Id)
                  .Paginate(pageIndex, pageSize);
        }

        public IEnumerable<FlowItemDefinition> ListFlowItemsByAggregator(string aggregatorId, int? pageIndex = null, int? pageSize = null) {
            return ListObjects<FlowItemDefinition>(_flowItemsPath, FLOW_ITEMS_PREFIX, null, null)
                  .Where(f => f.AggregatorId == aggregatorId)
                  .OrderBy(f => f.Id)
                  .Paginate(pageIndex, pageSize);
        }

        public IEnumerable<FlowItemDefinition> ListFlowItemsByWriter(string writerId, int? pageIndex = null, int? pageSize = null) {
            return ListObjects<FlowItemDefinition>(_flowItemsPath, FLOW_ITEMS_PREFIX, null, null)
                  .Where(f => f.WriterId == writerId)
                  .OrderBy(f => f.Id)
                  .Paginate(pageIndex, pageSize);
        }
    }
}
