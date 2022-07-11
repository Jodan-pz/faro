using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

using DHARMA.Dave.Configurable;
using DHARMA.Dave.Extensions.DependencyInjection;
using DHARMA.Extensions.DependencyInjection;

using FARO.Common;
using FARO.Dharma.Support;

namespace FARO.Extensions.DependencyInjection {

    public static class FAROSupportExtensions {

        public static IServiceCollection AddFAROSupport(this IServiceCollection services,
                                                        IConfiguration config,
                                                        IHostEnvironment? hostEnvironment = null,
                                                        bool? isWebContext = false) {
            // Add Dave services
            services.AddDave(config);

            // Add Dave logging
            services.AddDaveLoggerSerilog(lb => {
                // if (webHostEnvironment)
                if (hostEnvironment?.IsDevelopment() ?? false) {
                    lb.DiagnoticDebug = config.GetValue("AddDiagnosticDebug", false);
                }
            });

            services.ConfigureWithDave<IAppSupport, AppSupport>((_, builder) => {
                builder.Parameters.WithCache
                       .MapSection("System")
                       .ToRoot();
                builder.Connections.WithCache
                       .Map("FARODB")
                       .ToProperty("DHARMA_FARODB")
                       .Map("CACHEDB")
                       .ToProperty("DHARMA_CACHEDB")
                       .Map("IMAGEPERSISTERDB")
                       .ToProperty("DHARMA_IMAGEPERSISTERDB");

                if (!(isWebContext ?? false)) {
                    builder.Arguments
                        .UseNamingStrategy(SnakeCaseNamingStrategy.Instance)
                        .MapToProperty("Arguments");
                }
            });
            var retrieverScope = hostEnvironment is not null ? ServiceLifetime.Scoped : ServiceLifetime.Singleton;
            services.Add(new ServiceDescriptor(typeof(DharmaConnectionRetriever), typeof(DharmaConnectionRetriever), retrieverScope));
            services.Add(new ServiceDescriptor(typeof(IConnectionRetriever), sp => {
                var dharmaRetriever = sp.GetRequiredService<DharmaConnectionRetriever>();
                dharmaRetriever.Init();
                return dharmaRetriever;
            }, retrieverScope));

            return services;
        }

        public static IServiceProvider ConfigureFAROSupport(this IServiceProvider serviceProvider, IConfiguration config) {
            // create Dave
            var identity = config.GetValue<string>("FakeIdentity");
            if (identity != null) {
                serviceProvider.CreateDave(c => c.DisableLogAccess().IdentifyUser(() => identity));
            } else {
                serviceProvider.CreateDave();
            }

            return serviceProvider;
        }

        public static IApplicationBuilder UseFAROSupport(this IApplicationBuilder appBuilder, IConfiguration config, IHostEnvironment? hostEnvironment = null) {
            // use Dave
            var identity = config.GetValue<string>("FakeIdentity");
            if (hostEnvironment?.IsDevelopment() ?? false) {
                if (identity is not null) {
                    appBuilder.UseFakeIdentity(identity);
                }
                appBuilder.UseDave(cb => cb.DisableCheckApplicationState().PassportExpirationUndefined()); // session token (no time limit)
            } else {
                appBuilder.UseDave(pb => pb.PassportExpirationUndefined());
            }
            return appBuilder;
        }
    }
}
