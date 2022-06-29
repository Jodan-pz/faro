using System.Collections.Generic;
using FARO.Common.Domain;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;
using Newtonsoft.Json;

namespace FARO.DataLayer.MongoDb {
    public class LayerFieldItemDefinitionSerializer : SerializerBase<LayerFieldItemDefinition> {
        public override LayerFieldItemDefinition Deserialize(BsonDeserializationContext context, BsonDeserializationArgs args) {
            var serializer = BsonSerializer.LookupSerializer<BsonDocument>();
            var document = serializer.Deserialize(context, args);
            return JsonConvert.DeserializeObject<LayerFieldItemDefinition>(document.ToJson());
        }

        public override void Serialize(BsonSerializationContext context, BsonSerializationArgs args, LayerFieldItemDefinition value) {
            BsonDocument bsonDocument = null;
            if (value != null) {
                var jsonDocument = JsonConvert.SerializeObject(value);
                bsonDocument = BsonSerializer.Deserialize<BsonDocument>(jsonDocument);
            } else {
                bsonDocument = new BsonDocument();
            }

            var serializer = BsonSerializer.LookupSerializer<BsonDocument>();
            serializer.Serialize(context, bsonDocument.AsBsonValue);
        }
    }
    public class DynamicDictionarySerializer : SerializerBase<IDictionary<string, dynamic>> {
        public override IDictionary<string, dynamic> Deserialize(BsonDeserializationContext context, BsonDeserializationArgs args) {
            var serializer = BsonSerializer.LookupSerializer<BsonDocument>();
            var document = serializer.Deserialize(context, args);
            return JsonConvert.DeserializeObject<IDictionary<string, object>>(document.ToJson());
        }

        public override void Serialize(BsonSerializationContext context, BsonSerializationArgs args, IDictionary<string, dynamic> value) {
            BsonDocument bsonDocument = null;
            if (value != null) {
                var jsonDocument = JsonConvert.SerializeObject(value, new JsonSerializerSettings());
                bsonDocument = BsonSerializer.Deserialize<BsonDocument>(jsonDocument);
            } else {
                bsonDocument = new BsonDocument();
            }
            var serializer = BsonSerializer.LookupSerializer<BsonDocument>();
            serializer.Serialize(context, bsonDocument.AsBsonValue);
        }
    }
}