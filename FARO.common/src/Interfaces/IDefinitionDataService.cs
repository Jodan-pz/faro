using System.Collections.Generic;

using FARO.Common.Domain;

namespace FARO.Common {
    public interface IDefinitionDataService {

        IEnumerable<FlowItemDefinition> ListFlowItemsByImage(string imageId, int? pageIndex = null, int? pageSize = null);
        IEnumerable<FlowItemDefinition> ListFlowItemsByValidator(string validatorId, int? pageIndex = null, int? pageSize = null);
        IEnumerable<FlowItemDefinition> ListFlowItemsByAggregator(string aggregatorId, int? pageIndex = null, int? pageSize = null);
        IEnumerable<FlowItemDefinition> ListFlowItemsByWriter(string writerId, int? pageIndex = null, int? pageSize = null);
        IEnumerable<ImageDefinition> ListImagesByDecorator(string decoratorId, int? pageIndex = null, int? pageSize = null);
        IEnumerable<ImageDefinition> ListImagesByKeysIterator(string keysIteratorId, int? pageIndex = null, int? pageSize = null);

        IEnumerable<KeysIteratorDefinition> ListKeysIterators(string filter = null,
                                                              FilterMatchMode filterMode = FilterMatchMode.Contains,
                                                              string[] tags = null,
                                                              TagsMatchMode tagsMatchMode = TagsMatchMode.Any,
                                                              int? pageIndex = null, int? pageSize = null);

        KeysIteratorDefinition GetKeysIterator(string id);
        KeysIteratorDefinition CreateKeysIterator(KeysIteratorDefinition keysIterator);
        KeysIteratorDefinition UpdateKeysIterator(string id, KeysIteratorDefinition keysIterator);
        bool DeleteKeysIterator(string id);

        IEnumerable<DecoratorDefinition> ListDecorators(string filter = null,
                                                        FilterMatchMode filterMode = FilterMatchMode.Contains,
                                                        string[] tags = null,
                                                        TagsMatchMode tagsMatchMode = TagsMatchMode.Any,
                                                        int? pageIndex = null, int? pageSize = null);
        DecoratorDefinition GetDecorator(string id);
        DecoratorDefinition CreateDecorator(DecoratorDefinition decorator);
        DecoratorDefinition UpdateDecorator(string id, DecoratorDefinition decorator);
        bool DeleteDecorator(string id);

        IEnumerable<ImageDefinition> ListImages(string filter = null,
                                                FilterMatchMode filterMode = FilterMatchMode.Contains,
                                                string[] tags = null,
                                                TagsMatchMode tagsMatchMode = TagsMatchMode.Any,
                                                int? pageIndex = null, int? pageSize = null);
        ImageDefinition GetImage(string id);
        ImageDefinition CreateImage(ImageDefinition image);
        ImageDefinition UpdateImage(string id, ImageDefinition image);
        bool DeleteImage(string id);

        IEnumerable<WriterDefinition> ListWriters(string filter = null,
                                                  FilterMatchMode filterMode = FilterMatchMode.Contains,
                                                  string[] tags = null,
                                                  TagsMatchMode tagsMatchMode = TagsMatchMode.Any,
                                                  int? pageIndex = null, int? pageSize = null);

        WriterDefinition GetWriter(string id);
        WriterDefinition CreateWriter(WriterDefinition writer);
        WriterDefinition UpdateWriter(string id, WriterDefinition writer);
        bool DeleteWriter(string id);

        IEnumerable<FlowItemDefinition> ListFlowItems(string filter = null,
                                                      FilterMatchMode filterMode = FilterMatchMode.Contains,
                                                      string[] tags = null,
                                                      TagsMatchMode tagsMatchMode = TagsMatchMode.Any,
                                                      int? pageIndex = null, int? pageSize = null);
        FlowItemDefinition GetFlowItemByName(string name);
        FlowItemDefinition GetFlowItem(string id);
        FlowItemDefinition CreateFlowItem(FlowItemDefinition flowItem);
        FlowItemDefinition UpdateFlowItem(string id, FlowItemDefinition flowItem);
        bool DeleteFlowItem(string id);

        IEnumerable<AggregatorDefinition> ListAggregators(string filter = null,
                                                          FilterMatchMode filterMode = FilterMatchMode.Contains,
                                                          string[] tags = null,
                                                          TagsMatchMode tagsMatchMode = TagsMatchMode.Any,
                                                          int? pageIndex = null, int? pageSize = null);
        IEnumerable<AggregatorDefinition> GetImageAggregators(string imageId);
        AggregatorDefinition GetAggregator(string id);
        AggregatorDefinition CreateAggregator(AggregatorDefinition aggregator);
        AggregatorDefinition UpdateAggregator(string id, AggregatorDefinition aggregator);
        bool DeleteAggregator(string id);


        IEnumerable<ValidatorDefinition> ListValidators(string filter = null,
                                                        FilterMatchMode filterMode = FilterMatchMode.Contains,
                                                        string[] tags = null,
                                                        TagsMatchMode tagsMatchMode = TagsMatchMode.Any,
                                                        int? pageIndex = null, int? pageSize = null);
        ValidatorDefinition GetValidator(string id);
        ValidatorDefinition CreateValidator(ValidatorDefinition aggregator);
        ValidatorDefinition UpdateValidator(string id, ValidatorDefinition aggregator);
        bool DeleteValidator(string id);
    }
}