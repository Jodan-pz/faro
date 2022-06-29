using System.Collections.Generic;
using FARO.Common.Domain;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.IdGenerators;
using MongoDB.Bson.Serialization.Serializers;
using Yoda.MongoDb;

namespace FARO.DataLayer.MongoDb {
    public class FARODbMappings : IMongoMappings {
        /// <summary>
        /// Register FARO MongoDb class mappings
        /// </summary>
        public void Register() {
            if (BsonClassMap.IsClassMapRegistered(typeof(FlowItemDefinition))) return; // guard

            BsonSerializer.RegisterSerializer(typeof(IDictionary<string, dynamic>), new DynamicDictionarySerializer());
            BsonSerializer.RegisterSerializer(typeof(LayerFieldItemDefinition), new LayerFieldItemDefinitionSerializer());

            BsonClassMap.RegisterClassMap<FlowItemDefinition>(cm => {
                cm.AutoMap();
                cm.SetIgnoreExtraElements(true);
                cm.MapIdMember(c => c.Id)
                  .SetIgnoreIfDefault(true)
                  .SetSerializer(new StringSerializer(BsonType.ObjectId))
                  .SetIdGenerator(StringObjectIdGenerator.Instance);
            });

            BsonClassMap.RegisterClassMap<WriterDefinition>(cm => {
                cm.AutoMap();
                cm.SetIgnoreExtraElements(true);
                cm.MapIdMember(c => c.Id)
                  .SetIgnoreIfDefault(true)
                  .SetSerializer(new StringSerializer(BsonType.ObjectId))
                  .SetIdGenerator(StringObjectIdGenerator.Instance);
            });

            BsonClassMap.RegisterClassMap<ImageDefinition>(cm => {
                cm.AutoMap();
                cm.SetIgnoreExtraElements(true);

                cm.MapIdMember(c => c.Id)
                  .SetIgnoreIfDefault(true)
                  .SetSerializer(new StringSerializer(BsonType.ObjectId))
                  .SetIdGenerator(StringObjectIdGenerator.Instance);
            });

            BsonClassMap.RegisterClassMap<KeysIteratorDefinition>(cm => {
                cm.AutoMap();
                cm.SetIgnoreExtraElements(true);
                cm.MapIdMember(c => c.Id)
                  .SetIgnoreIfDefault(true)
                  .SetSerializer(new StringSerializer(BsonType.ObjectId))
                  .SetIdGenerator(StringObjectIdGenerator.Instance);
            });

            BsonClassMap.RegisterClassMap<DecoratorDefinition>(cm => {
                cm.AutoMap();
                cm.SetIgnoreExtraElements(true);
                cm.MapIdMember(c => c.Id)
                  .SetIgnoreIfDefault(true)
                  .SetSerializer(new StringSerializer(BsonType.ObjectId))
                  .SetIdGenerator(StringObjectIdGenerator.Instance);
            });

            BsonClassMap.RegisterClassMap<AggregatorDefinition>(cm => {
                cm.AutoMap();
                cm.SetIgnoreExtraElements(true);
                cm.MapIdMember(c => c.Id)
                  .SetIgnoreIfDefault(true)
                  .SetSerializer(new StringSerializer(BsonType.ObjectId))
                  .SetIdGenerator(StringObjectIdGenerator.Instance);
            });

            BsonClassMap.RegisterClassMap<ValidatorDefinition>(cm => {
                cm.AutoMap();
                cm.SetIgnoreExtraElements(true);
                cm.MapIdMember(c => c.Id)
                  .SetIgnoreIfDefault(true)
                  .SetSerializer(new StringSerializer(BsonType.ObjectId))
                  .SetIdGenerator(StringObjectIdGenerator.Instance);
            });
        }
    }
}
