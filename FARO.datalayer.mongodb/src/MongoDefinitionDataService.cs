using System;
using System.Collections.Generic;
using System.Linq;

using FARO.Common;
using FARO.Common.Domain;
using FARO.Common.Exceptions;
using FARO.Common.Helpers;

using LinqKit;

using Yoda.Common.Interfaces;
using PredicateBuilder = LinqKit.PredicateBuilder;

namespace FARO.DataLayer.MongoDb {
    public class MongoDefinitionDataService : IDefinitionDataService {
        readonly IDocumentUnitOfWork _uow;
        const string DOC_FLOWS = "flows";
        const string DOC_WRITERS = "writers";
        const string DOC_IMAGES = "images";
        const string DOC_KEYS_ITERATORS = "keysiterators";
        const string DOC_DECORATORS = "decorators";
        const string DOC_AGGREGATORS = "aggregators";
        const string DOC_VALIDATORS = "validators";

        public MongoDefinitionDataService(IDocumentUnitOfWork uow) {
            _uow = uow ?? throw new ArgumentNullException(nameof(uow));
        }

        public DecoratorDefinition CreateDecorator(DecoratorDefinition decorator) {
            return _uow.Add(DOC_DECORATORS, decorator);
        }

        public FlowItemDefinition CreateFlowItem(FlowItemDefinition flowItem) {
            return _uow.Add(DOC_FLOWS, flowItem);
        }

        public ImageDefinition CreateImage(ImageDefinition image) {
            return _uow.Add(DOC_IMAGES, image);
        }

        public KeysIteratorDefinition CreateKeysIterator(KeysIteratorDefinition keysIterator) {
            return _uow.Add(DOC_KEYS_ITERATORS, keysIterator);
        }

        public WriterDefinition CreateWriter(WriterDefinition writer) {
            return _uow.Add(DOC_WRITERS, writer);
        }

        public AggregatorDefinition CreateAggregator(AggregatorDefinition aggregator) {
            return _uow.Add(DOC_AGGREGATORS, aggregator);
        }

        public ValidatorDefinition CreateValidator(ValidatorDefinition validator) {
            return _uow.Add(DOC_VALIDATORS, validator);
        }

        public bool DeleteFlowItem(string id) {
            return _uow.DeleteById(DOC_FLOWS, id) == 1;
        }

        public bool DeleteKeysIterator(string id) {
            var images = ListImagesByKeysIterator(id);
            if (images?.Any() ?? false) throw new ObjectDefinitionException(id, images.Aggregate("Cannot delete keys iterator. These images are using it: ", (c, o) => c + $"'{o.Name}' ").Trim(' '));
            return _uow.DeleteById(DOC_KEYS_ITERATORS, id) == 1;
        }

        public bool DeleteDecorator(string id) {
            var images = ListImagesByDecorator(id);
            if (images.Any()) throw new ObjectDefinitionException(id, images.Aggregate("Cannot delete decorator. These images are using it: ", (c, o) => c + $"'{o.Name}' ").Trim(' '));
            return _uow.DeleteById(DOC_DECORATORS, id) == 1;
        }

        public bool DeleteImage(string id) {
            var flows = ListFlowItemsByImage(id);
            if (flows?.Any() ?? false) throw new ObjectDefinitionException(id, flows.Aggregate("Cannot delete image. These flows are using it: ", (c, o) => c + $"'{o.Name}' ").Trim(' '));
            var ret = _uow.DeleteById(DOC_IMAGES, id) == 1;
            if (ret) {
                _uow.DeleteAll<AggregatorDefinition>(DOC_AGGREGATORS, v => v.ImageId == id);
            }
            return ret;
        }

        public bool DeleteValidator(string id) {
            var flows = ListFlowItemsByValidator(id);
            if (flows?.Any() ?? false) throw new ObjectDefinitionException(id, flows.Aggregate("Cannot delete validator. These flows are using it: ", (c, o) => c + $"'{o.Name}' ").Trim(' '));
            return _uow.DeleteById(DOC_VALIDATORS, id) == 1;
        }

        public bool DeleteAggregator(string id) {
            var flows = ListFlowItemsByAggregator(id);
            if (flows?.Any() ?? false) throw new ObjectDefinitionException(id, flows.Aggregate("Cannot delete aggregator. These flows are using it: ", (c, o) => c + $"'{o.Name}' ").Trim(' '));
            return _uow.DeleteById(DOC_AGGREGATORS, id) == 1;
        }

        public bool DeleteWriter(string id) {
            var flows = ListFlowItemsByWriter(id);
            if (flows?.Any() ?? false) throw new ObjectDefinitionException(id, flows.Aggregate("Cannot delete writer. These flows are using it: ", (c, o) => c + $"'{o.Name}' ").Trim(' '));
            return _uow.DeleteById(DOC_WRITERS, id) == 1;
        }

        public DecoratorDefinition GetDecorator(string id) {
            return _uow.GetById<DecoratorDefinition>(DOC_DECORATORS, id);
        }

        public FlowItemDefinition GetFlowItemByName(string name) {
            return _uow.FindOne<FlowItemDefinition>(DOC_FLOWS, flow => flow.Name == name);
        }

        public FlowItemDefinition GetFlowItem(string id) {
            return _uow.GetById<FlowItemDefinition>(DOC_FLOWS, id);
        }

        public ImageDefinition GetImage(string id) {
            return _uow.GetById<ImageDefinition>(DOC_IMAGES, id);
        }

        public IEnumerable<AggregatorDefinition> GetImageAggregators(string imageId) {
            return _uow.FindAll<AggregatorDefinition>(DOC_AGGREGATORS, a => a.ImageId == imageId);
        }

        public KeysIteratorDefinition GetKeysIterator(string id) {
            return _uow.GetById<KeysIteratorDefinition>(DOC_KEYS_ITERATORS, id);
        }

        public WriterDefinition GetWriter(string id) {
            return _uow.GetById<WriterDefinition>(DOC_WRITERS, id);
        }

        public AggregatorDefinition GetAggregator(string id) {
            return _uow.GetById<AggregatorDefinition>(DOC_AGGREGATORS, id);
        }

        public ValidatorDefinition GetValidator(string id) {
            return _uow.GetById<ValidatorDefinition>(DOC_VALIDATORS, id);
        }

        public IEnumerable<DecoratorDefinition> ListDecorators(string filter, FilterMatchMode filterMode, string[] tags, TagsMatchMode tagsMatchMode, int? pageIndex, int? pageSize) {
            return _uow.FindAll<DecoratorDefinition>(DOC_DECORATORS, CommonListPredicate<DecoratorDefinition>(filter, filterMode, tags, tagsMatchMode), o => o.OrderBy(f => f.Name), pageIndex, pageSize);
        }

        public IEnumerable<FlowItemDefinition> ListFlowItems(string filter, FilterMatchMode filterMode, string[] tags, TagsMatchMode tagsMatchMode, int? pageIndex, int? pageSize) {
            return _uow.FindAll<FlowItemDefinition>(DOC_FLOWS, CommonListPredicate<FlowItemDefinition>(filter, filterMode, tags, tagsMatchMode), o => o.OrderBy(f => f.Name), pageIndex, pageSize);
        }

        public IEnumerable<ImageDefinition> ListImages(string filter, FilterMatchMode filterMode, string[] tags, TagsMatchMode tagsMatchMode, int? pageIndex, int? pageSize) {
            return _uow.FindAll<ImageDefinition>(DOC_IMAGES, CommonListPredicate<ImageDefinition>(filter, filterMode, tags, tagsMatchMode), o => o.OrderBy(f => f.Name), pageIndex, pageSize);
        }

        public IEnumerable<KeysIteratorDefinition> ListKeysIterators(string filter, FilterMatchMode filterMode, string[] tags, TagsMatchMode tagsMatchMode, int? pageIndex, int? pageSize) {
            return _uow.FindAll<KeysIteratorDefinition>(DOC_KEYS_ITERATORS, CommonListPredicate<KeysIteratorDefinition>(filter, filterMode, tags, tagsMatchMode), o => o.OrderBy(f => f.Name), pageIndex, pageSize);
        }

        public IEnumerable<WriterDefinition> ListWriters(string filter, FilterMatchMode filterMode, string[] tags, TagsMatchMode tagsMatchMode, int? pageIndex, int? pageSize) {
            return _uow.FindAll<WriterDefinition>(DOC_WRITERS, CommonListPredicate<WriterDefinition>(filter, filterMode, tags, tagsMatchMode), o => o.OrderBy(f => f.Name), pageIndex, pageSize);
        }

        public IEnumerable<AggregatorDefinition> ListAggregators(string filter, FilterMatchMode filterMode, string[] tags, TagsMatchMode tagsMatchMode, int? pageIndex, int? pageSize) {
            return _uow.FindAll<AggregatorDefinition>(DOC_AGGREGATORS, CommonListPredicate<AggregatorDefinition>(filter, filterMode, tags, tagsMatchMode), o => o.OrderBy(f => f.Name), pageIndex, pageSize);
        }

        public IEnumerable<ValidatorDefinition> ListValidators(string filter, FilterMatchMode filterMode, string[] tags, TagsMatchMode tagsMatchMode, int? pageIndex, int? pageSize) {
            return _uow.FindAll<ValidatorDefinition>(DOC_VALIDATORS, CommonListPredicate<ValidatorDefinition>(filter, filterMode, tags, tagsMatchMode), o => o.OrderBy(f => f.Name), pageIndex, pageSize);
        }

        public DecoratorDefinition UpdateDecorator(string id, DecoratorDefinition decorator) {
            if (id != decorator.Id) throw new ArgumentException("Cannot modify id!");
            return _uow.Update(DOC_DECORATORS, decorator);
        }

        public FlowItemDefinition UpdateFlowItem(string id, FlowItemDefinition flowItem) {
            if (id != flowItem.Id) throw new ArgumentException("Cannot modify id!");
            return _uow.Update(DOC_FLOWS, flowItem);
        }

        public ImageDefinition UpdateImage(string id, ImageDefinition image) {
            if (id != image.Id) throw new ArgumentException("Cannot modify id!");
            return _uow.Update(DOC_IMAGES, image);
        }

        public KeysIteratorDefinition UpdateKeysIterator(string id, KeysIteratorDefinition keysIterator) {
            if (id != keysIterator.Id) throw new ArgumentException("Cannot modify id!");
            return _uow.Update(DOC_KEYS_ITERATORS, keysIterator);
        }

        public WriterDefinition UpdateWriter(string id, WriterDefinition writer) {
            if (id != writer.Id) throw new ArgumentException("Cannot modify id!");
            return _uow.Update(DOC_WRITERS, writer);
        }

        public AggregatorDefinition UpdateAggregator(string id, AggregatorDefinition aggregator) {
            if (id != aggregator.Id) throw new ArgumentException("Cannot modify id!");
            return _uow.Update(DOC_AGGREGATORS, aggregator);
        }

        public ValidatorDefinition UpdateValidator(string id, ValidatorDefinition validator) {
            if (id != validator.Id) throw new ArgumentException("Cannot modify id!");
            return _uow.Update(DOC_VALIDATORS, validator);
        }

        public IEnumerable<ImageDefinition> ListImagesByKeysIterator(string keysIteratorId, int? pageIndex = null, int? pageSize = null)
        => _uow.FindAll<ImageDefinition>(DOC_IMAGES,
                                        i => i.KeysIterators != null && i.KeysIterators.Any(o => o.KeyId == keysIteratorId),
                                        o => o.OrderBy(f => f.Id),
                                        pageIndex,
                                        pageSize);

        public IEnumerable<ImageDefinition> ListImagesByDecorator(string decoratorId, int? pageIndex = null, int? pageSize = null) {
            var qs = _uow.GetQuerySpec<ImageDefinitionQuerySpec>() ?? throw new NullReferenceException($"Cannot create {nameof(ImageDefinitionQuerySpec)}!");
            return qs.FindImagesByDecorator(decoratorId, pageIndex, pageSize);
        }

        public IEnumerable<FlowItemDefinition> ListFlowItemsByImage(string imageId, int? pageIndex = null, int? pageSize = null)
         => _uow.FindAll<FlowItemDefinition>(DOC_FLOWS,
                                             flow => flow.ImageId == imageId,
                                             o => o.OrderBy(f => f.Id),
                                             pageIndex,
                                             pageSize);

        public IEnumerable<FlowItemDefinition> ListFlowItemsByValidator(string validatorId, int? pageIndex = null, int? pageSize = null) {
            var qs = _uow.GetQuerySpec<FlowDefinitionQuerySpec>() ?? throw new NullReferenceException($"Cannot create {nameof(FlowDefinitionQuerySpec)}!");
            return qs.FindFlowItemsByValidator(validatorId, pageIndex, pageSize);
        }

        public IEnumerable<FlowItemDefinition> ListFlowItemsByAggregator(string aggregatorId, int? pageIndex = null, int? pageSize = null)
        => _uow.FindAll<FlowItemDefinition>(DOC_FLOWS,
                                             flow => flow.AggregatorId == aggregatorId,
                                             o => o.OrderBy(f => f.Id),
                                             pageIndex,
                                             pageSize);

        public IEnumerable<FlowItemDefinition> ListFlowItemsByWriter(string writerId, int? pageIndex = null, int? pageSize = null) {
            var qs = _uow.GetQuerySpec<FlowDefinitionQuerySpec>() ?? throw new NullReferenceException($"Cannot create {nameof(FlowDefinitionQuerySpec)}!");
            return qs.FindFlowItemsByWriter(writerId, pageIndex, pageSize);
        }

        static ExpressionStarter<T> CommonListPredicate<T>(string filter, FilterMatchMode filterMode, string[] tags, TagsMatchMode tagsMatchMode) where T : IObjectDefinition {
            var pred = PredicateBuilder.New<T>();
            if (!MiscHelper.IsNullOrEmpty(filter)) {
                switch (filterMode) {
                    case FilterMatchMode.Contains:
                        pred = pred.Or(fw => fw.Name.ToLower().Contains(filter));
                        pred = pred.Or(fw => fw.Description.ToLower().Contains(filter));
                        break;
                    case FilterMatchMode.StartsWith:
                        pred = pred.Or(fw => fw.Name.ToLower().StartsWith(filter));
                        pred = pred.Or(fw => fw.Description.ToLower().StartsWith(filter));
                        break;
                    case FilterMatchMode.Exact:
                        pred = pred.Or(fw => fw.Name.ToLower() == filter.ToLower());
                        pred = pred.Or(fw => fw.Description.ToLower() == filter.ToLower());
                        break;
                }
            }
            if (tags != null && tags.Length > 0) {
                switch (tagsMatchMode) {
                    case TagsMatchMode.Any:
                        pred = pred.And(fw => fw.Tags.Any(t => tags.Contains(t)));
                        break;
                    case TagsMatchMode.All: {
                            foreach (var tag in tags) pred = pred.And(fw => fw.Tags.Contains(tag));
                            break;
                        }
                }
            }
            return pred.IsStarted ? pred : null;
        }

    }
}
