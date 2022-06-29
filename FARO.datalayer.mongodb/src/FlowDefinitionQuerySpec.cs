using System.Collections.Generic;
using System.Linq;

using FARO.Common;
using FARO.Common.Domain;

using MongoDB.Driver;

using Yoda.MongoDb;
namespace FARO.DataLayer.MongoDb {
    public class FlowDefinitionQuerySpec : MongoDbBaseQuerySpec {
        const string DOC_FLOWS = "flows";
        const string DOC_VALIDATORS = "validators";
        const string DOC_WRITERS = "writers";


        public FlowDefinitionQuerySpec() { }
        public FlowDefinitionQuerySpec(IMongoDatabase database) : base(database) { }

        IEnumerable<string> RecurseFindItemIds<T>(IMongoCollection<T> collection, string id) where T : IObjectDefinition {
            var txtSearchObjectId = collection.Find(Builders<T>.Filter.Text(id)).ToEnumerable();
            foreach (var objFound in txtSearchObjectId) {
                foreach (var recurseObjId in RecurseFindItemIds(collection, objFound.Id))
                    yield return recurseObjId;
            }
            yield return id;
        }

        public IEnumerable<FlowItemDefinition> FindFlowItemsByValidator(string validatorId, int? pageIndex, int? pageSize) {
            var validators = Database.GetCollection<ValidatorDefinition>(DOC_VALIDATORS);
            validators.Indexes.CreateOne(
                new CreateIndexModel<ValidatorDefinition>(
                    Builders<ValidatorDefinition>.IndexKeys.Text("$**"),
                    new CreateIndexOptions { Collation = Collation.Simple })
            );

            var flows = Database.GetCollection<FlowItemDefinition>(DOC_FLOWS);
            var filterIds = RecurseFindItemIds(validators, validatorId);
            var filter = Builders<FlowItemDefinition>.Filter.In(f => f.ValidatorId, filterIds);
            int? skip = null;
            int? limit = null;
            if (pageIndex != null && pageSize != null) {
                limit = pageSize.Value < 1 ? 0 : pageSize.Value;
                skip = pageIndex.Value <= 1 ? 0 : (pageIndex.Value - 1) * limit;
            }
            return flows.Find(filter)
                        .SortBy(i => i.Id)
                        .Skip(skip)
                        .Limit(limit)
                        .ToList();
        }

        public IEnumerable<FlowItemDefinition> FindFlowItemsByWriter(string writerId, int? pageIndex, int? pageSize) {
            var writers = Database.GetCollection<WriterDefinition>(DOC_WRITERS);
            writers.Indexes.CreateOne(
                new CreateIndexModel<WriterDefinition>(
                    Builders<WriterDefinition>.IndexKeys.Text("$**"),
                    new CreateIndexOptions { Collation = Collation.Simple })
            );

            var flows = Database.GetCollection<FlowItemDefinition>(DOC_FLOWS);
            var filterIds = RecurseFindItemIds(writers, writerId);
            var filter = Builders<FlowItemDefinition>.Filter.In(f => f.WriterId, filterIds);
            int? skip = null;
            int? limit = null;
            if (pageIndex != null && pageSize != null) {
                limit = pageSize.Value < 1 ? 0 : pageSize.Value;
                skip = pageIndex.Value <= 1 ? 0 : (pageIndex.Value - 1) * limit;
            }
            return flows.Find(filter)
                        .SortBy(i => i.Id)
                        .Skip(skip)
                        .Limit(limit)
                        .ToList();
        }
    }

}