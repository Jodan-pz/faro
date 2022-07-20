using System;
using FARO.Common;
using MongoDB.Driver;
using Yoda.MongoDb;

namespace FARO.DataLayer.MongoDb {
    public class FARODbOptionsBuilder {
        readonly IAppSupport _appSupport;
        public FARODbOptionsBuilder(IAppSupport appSupport) {
            _appSupport = appSupport ?? throw new ArgumentNullException(nameof(appSupport));
        }
        public MongoDbOptions Buildptions() {
            MongoDbOptions ret = null;
            var db = _appSupport.FARODB;
            if (db != null) {
                var (server, database, user, password) = db.Value;
                if (server is null) return ret;
                string mongoServer;
                if (server.ToLower().StartsWith("mongodb://", StringComparison.OrdinalIgnoreCase)) {
                    mongoServer = server;
                } else {
                    var mb = new MongoUrlBuilder
                    {
                        Server = new MongoServerAddress(server, 27017)
                    };
                    mongoServer = mb.ToMongoUrl().ToString();
                }

                var mongoDatabase = database;
                var mongoUser = user;
                var mongoPassword = password;
                ret = new MongoDbOptions(mongoServer, mongoDatabase, mongoUser, mongoPassword) { CredentialsDatabase = "admin" };
            }
            return ret;
        }
    }
}
