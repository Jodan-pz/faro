using System;
using System.Collections.Generic;
using System.IO;

using FARO.Common;
using FARO.Common.Domain;

namespace FARO.Services {

    public class FlowConfigurationReaderAdapter : IFlowConfigurationBuilder, IDefinitionDataService {
        private readonly FileInfo _configurationFile;
        private readonly IFlowConfigurationReader _reader;
        private FlowConfiguration _currentConfiguration;
        private IImageItemResolver _currentResolver;

        public FlowConfigurationReaderAdapter(FileInfo configurationFile, IFlowConfigurationReader reader) {
            _configurationFile = configurationFile ?? throw new ArgumentNullException(nameof(configurationFile));
            _reader = reader ?? throw new ArgumentNullException(nameof(reader));
        }

        #region IFlowConfigurationBuilder
        FlowConfiguration IFlowConfigurationBuilder.Build(string flowId, string flowName) {
            _currentConfiguration = _reader.Read(_configurationFile);
            var ret = new FlowConfiguration();
            _currentConfiguration.All((fi, _, _) => {
                if (fi.Definition.Id == flowId || fi.Definition.Name == flowName) {
                    _currentResolver = fi.Image.ItemResolver;
                    ret.AddFlowItem(fi);
                }
            });
            return ret;
        }
        #endregion

        #region IDefinitionDataService

        FlowItemDefinition IDefinitionDataService.GetFlowItem(string id) {
            FlowItemDefinition def = null;
            if (id == null) return def;
            _currentConfiguration.All((fi, _, _) => {
                if (fi.Definition.Id == id) def = fi.Definition;
            });
            return def;
        }

        ImageDefinition IDefinitionDataService.GetImage(string id) {
            ImageDefinition def = null;
            if (id == null) return def;
            _currentConfiguration.All((fi, _, _) => {
                if (fi.Image?.Definition.Id == id) def = fi.Image.Definition;
            });
            return def;
        }

        AggregatorDefinition IDefinitionDataService.GetAggregator(string id) {
            AggregatorDefinition def = null;
            if (id == null) return def;
            _currentConfiguration.All((fi, _, _) => {
                if (fi.Aggregator?.Definition.Id == id) def = fi.Aggregator.Definition;
            });
            return def;
        }

        DecoratorDefinition IDefinitionDataService.GetDecorator(string id) => _currentResolver?.GetDecoratorDefinition(id);

        KeysIteratorDefinition IDefinitionDataService.GetKeysIterator(string id) => _currentResolver?.GetKeysIteratorDefinition(id);

        ValidatorDefinition IDefinitionDataService.GetValidator(string id) {
            ValidatorDefinition def = null;
            _currentConfiguration.All((fi, _, _) => {
                if (fi.Validator?.Definition.Id == id) def = fi.Validator.Definition;
            });
            return def;
        }

        WriterDefinition IDefinitionDataService.GetWriter(string id) {
            WriterDefinition def = null;
            _currentConfiguration.All((fi, _, _) => {
                if (fi.Writer?.Definition.Id == id) def = fi.Writer.Definition;
            });
            return def;
        }

        #endregion

        #region IFlowConfigurationBuilder (Not Supported Methods)
        public FlowConfiguration Build(params FlowItemDefinition[] flowItemDefinitions) {
            throw new NotImplementedException();
        }

        public FlowConfiguration Build(ImageDefinition imageDefinition, ValidatorDefinition validatorDefinition = null, AggregatorDefinition aggregatorDefinition = null, WriterDefinition writerDefinition = null) {
            throw new NotImplementedException();
        }
        #endregion

        #region IDefinitionDataService (Not Supported Methods)

        public AggregatorDefinition CreateAggregator(AggregatorDefinition aggregator) {
            throw new NotImplementedException();
        }

        public DecoratorDefinition CreateDecorator(DecoratorDefinition decorator) {
            throw new NotImplementedException();
        }

        public FlowItemDefinition CreateFlowItem(FlowItemDefinition flowItem) {
            throw new NotImplementedException();
        }

        public ImageDefinition CreateImage(ImageDefinition image) {
            throw new NotImplementedException();
        }

        public KeysIteratorDefinition CreateKeysIterator(KeysIteratorDefinition keysIterator) {
            throw new NotImplementedException();
        }

        public ValidatorDefinition CreateValidator(ValidatorDefinition validator) {
            throw new NotImplementedException();
        }

        public WriterDefinition CreateWriter(WriterDefinition writer) {
            throw new NotImplementedException();
        }

        public bool DeleteAggregator(string id) {
            throw new NotImplementedException();
        }

        public bool DeleteDecorator(string id) {
            throw new NotImplementedException();
        }

        public bool DeleteFlowItem(string id) {
            throw new NotImplementedException();
        }

        public bool DeleteImage(string id) {
            throw new NotImplementedException();
        }

        public bool DeleteKeysIterator(string id) {
            throw new NotImplementedException();
        }

        public bool DeleteValidator(string id) {
            throw new NotImplementedException();
        }

        public bool DeleteWriter(string id) {
            throw new NotImplementedException();
        }

        public FlowItemDefinition GetFlowItemByName(string name) {
            throw new NotImplementedException();
        }


        public IEnumerable<AggregatorDefinition> GetImageAggregators(string imageId) {
            throw new NotImplementedException();
        }

        public IEnumerable<AggregatorDefinition> ListAggregators(string filter = null, FilterMatchMode filterMode = FilterMatchMode.Contains, string[] tags = null, TagsMatchMode tagsMatchMode = TagsMatchMode.Any, int? pageIndex = null, int? pageSize = null) {
            throw new NotImplementedException();
        }

        public IEnumerable<DecoratorDefinition> ListDecorators(string filter = null, FilterMatchMode filterMode = FilterMatchMode.Contains, string[] tags = null, TagsMatchMode tagsMatchMode = TagsMatchMode.Any, int? pageIndex = null, int? pageSize = null) {
            throw new NotImplementedException();
        }

        public IEnumerable<FlowItemDefinition> ListFlowItems(string filter = null, FilterMatchMode filterMode = FilterMatchMode.Contains, string[] tags = null, TagsMatchMode tagsMatchMode = TagsMatchMode.Any, int? pageIndex = null, int? pageSize = null) {
            throw new NotImplementedException();
        }

        public IEnumerable<FlowItemDefinition> ListFlowItemsByAggregator(string aggregatorId, int? pageIndex = null, int? pageSize = null) {
            throw new NotImplementedException();
        }

        public IEnumerable<FlowItemDefinition> ListFlowItemsByImage(string imageId, int? pageIndex = null, int? pageSize = null) {
            throw new NotImplementedException();
        }

        public IEnumerable<FlowItemDefinition> ListFlowItemsByValidator(string validatorId, int? pageIndex = null, int? pageSize = null) {
            throw new NotImplementedException();
        }

        public IEnumerable<FlowItemDefinition> ListFlowItemsByWriter(string writerId, int? pageIndex = null, int? pageSize = null) {
            throw new NotImplementedException();
        }

        public IEnumerable<ImageDefinition> ListImages(string filter = null, FilterMatchMode filterMode = FilterMatchMode.Contains, string[] tags = null, TagsMatchMode tagsMatchMode = TagsMatchMode.Any, int? pageIndex = null, int? pageSize = null) {
            throw new NotImplementedException();
        }

        public IEnumerable<ImageDefinition> ListImagesByDecorator(string decoratorId, int? pageIndex = null, int? pageSize = null) {
            throw new NotImplementedException();
        }

        public IEnumerable<ImageDefinition> ListImagesByKeysIterator(string keysIteratorId, int? pageIndex = null, int? pageSize = null) {
            throw new NotImplementedException();
        }

        public IEnumerable<KeysIteratorDefinition> ListKeysIterators(string filter = null, FilterMatchMode filterMode = FilterMatchMode.Contains, string[] tags = null, TagsMatchMode tagsMatchMode = TagsMatchMode.Any, int? pageIndex = null, int? pageSize = null) {
            throw new NotImplementedException();
        }

        public IEnumerable<ValidatorDefinition> ListValidators(string filter = null, FilterMatchMode filterMode = FilterMatchMode.Contains, string[] tags = null, TagsMatchMode tagsMatchMode = TagsMatchMode.Any, int? pageIndex = null, int? pageSize = null) {
            throw new NotImplementedException();
        }

        public IEnumerable<WriterDefinition> ListWriters(string filter = null, FilterMatchMode filterMode = FilterMatchMode.Contains, string[] tags = null, TagsMatchMode tagsMatchMode = TagsMatchMode.Any, int? pageIndex = null, int? pageSize = null) {
            throw new NotImplementedException();
        }

        public AggregatorDefinition UpdateAggregator(string id, AggregatorDefinition aggregator) {
            throw new NotImplementedException();
        }

        public DecoratorDefinition UpdateDecorator(string id, DecoratorDefinition decorator) {
            throw new NotImplementedException();
        }

        public FlowItemDefinition UpdateFlowItem(string id, FlowItemDefinition flowItem) {
            throw new NotImplementedException();
        }

        public ImageDefinition UpdateImage(string id, ImageDefinition image) {
            throw new NotImplementedException();
        }

        public KeysIteratorDefinition UpdateKeysIterator(string id, KeysIteratorDefinition keysIterator) {
            throw new NotImplementedException();
        }

        public ValidatorDefinition UpdateValidator(string id, ValidatorDefinition validator) {
            throw new NotImplementedException();
        }

        public WriterDefinition UpdateWriter(string id, WriterDefinition writer) {
            throw new NotImplementedException();
        }

        #endregion

    }
}
