using System;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using FARO.Common;
using FARO.DataLayer.MongoDb;

using Yoda.Common.Interfaces;
using Yoda.Common.UnitOfWork;
using Yoda.MongoDb.Extensions;

namespace FARO.Extensions.DependencyInjection {
    public static class DefinitionDataExtensions {

        public static IServiceCollection AddMongoDefinitionData(this IServiceCollection services, IConfiguration config, bool webApiScoped) {
            try {
                var scope = webApiScoped ? ServiceLifetime.Scoped : ServiceLifetime.Singleton;
                if (webApiScoped) {
                    services.AddSingleton<IQuerySpecFactory, BaseQuerySpecFactory>();
                    services.AddSingleton<IQuerySpec, ImageDefinitionQuerySpec>();
                    services.AddSingleton<IQuerySpec, FlowDefinitionQuerySpec>();
                }
                services.Add(new ServiceDescriptor(typeof(FARODbOptionsBuilder), typeof(FARODbOptionsBuilder), scope));
                services.AddMongoDbUnitOfWork<FARODbMappings>(sp => sp.GetRequiredService<FARODbOptionsBuilder>()
                                                                      .Buildptions(), scope);   /* Mongo UOW */
                services.Add(new ServiceDescriptor(typeof(IDefinitionDataService), typeof(MongoDefinitionDataService), scope));

            } catch (Exception ex) {
                Console.Error.WriteLine($"DEFINITION DATA REGISTRATION ERROR: {ex.Message}");
                /* ignore wrong configurations */
            }
            return services;
        }
    }
}
