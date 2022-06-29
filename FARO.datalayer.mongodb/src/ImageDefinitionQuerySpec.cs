using System.Collections.Generic;
using FARO.Common;
using FARO.Common.Domain;
using MongoDB.Bson;
using MongoDB.Driver;
using Yoda.MongoDb;

namespace FARO.DataLayer.MongoDb {
    public class ImageDefinitionQuerySpec : MongoDbBaseQuerySpec {
        const string DOC_IMAGES = "images";

        public ImageDefinitionQuerySpec() { }
        public ImageDefinitionQuerySpec(IMongoDatabase database) : base(database) { }

        public IEnumerable<ImageDefinition> FindImagesByDecorator(string decoratorId, int? pageIndex, int? pageSize) {
            var decoratorRegEx = new BsonRegularExpression(decoratorId);
            var filter = new BsonDocument { { "Layers.Items.config.decorator", decoratorRegEx } };
            int? skip = null;
            int? limit = null;
            if (pageIndex != null && pageSize != null) {
                limit = pageSize.Value < 1 ? 0 : pageSize.Value;
                skip = pageIndex.Value <= 1 ? 0 : (pageIndex.Value - 1) * limit;
            }
            var collection = Database.GetCollection<ImageDefinition>(DOC_IMAGES);
            return collection.Find(filter)
                             .SortBy(i => i.Id)
                             .Skip(skip)
                             .Limit(limit)
                             .ToList();
        }
    }
}