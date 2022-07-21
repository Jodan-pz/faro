using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using FARO.Common;
using FARO.Services.ImagePersister;
using FARO.Services.ImagePersister.Model;
using MySqlConnector;
using System.Linq;

namespace FARO.Extensions.DependencyInjection {

    public static class ImagePersisterExtensions {

        public static IServiceCollection AddMySqlImagePersister(this IServiceCollection services, IConfiguration config, bool webApiScoped) {
            try {
                var scope = webApiScoped ? ServiceLifetime.Scoped : ServiceLifetime.Singleton;
                services.AddDbContext<ImagePersisterDbContext>((sp, builder) => {
                    var support = sp.GetRequiredService<IAppSupport>();
                    if (support.IMAGEPERSISTERDB is null) throw new ArgumentException("Missing required connection");
                    var cs = GetConnectionString(support);
                    var serverVersion = ServerVersion.AutoDetect(cs);
                    builder.UseMySql(cs, serverVersion);

                }, scope, scope);

                services.Add(new ServiceDescriptor(typeof(IFlowItemImagePersister), typeof(MySqlFlowItemImagePersister), scope));

            } catch (Exception ex) {
                Console.Error.WriteLine($"IMAGE PERSISTER REGISTRATION ERROR: {ex.Message}");
                /* ignore wrong configurations */
            }
            return services;
        }

        private static string GetConnectionString(IAppSupport support) {
            (var serverAndPort, var db, var user, var pwd) = support.IMAGEPERSISTERDB.Value;
            var serverTokens = serverAndPort.Split(':');
            var server = serverTokens.First();
            var port = serverTokens.Length > 1 ? serverTokens.Last() : null;
            var csb = new MySqlConnectionStringBuilder
            {
                UserID = user,
                Server = server,
                Password = pwd,
                Database = db,
                AllowLoadLocalInfile = true,
                DefaultCommandTimeout = 120
            };
            if (port is not null) {
                csb.Port = uint.Parse(port);
            }
            return csb.ConnectionString;
        }
    }
}
