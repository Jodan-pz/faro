using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

using FARO.Common;
using FARO.Support;

namespace FARO.Extensions.DependencyInjection {


    public static class FAROSupportExtensions {

        public static IServiceCollection AddFAROSupport(this IServiceCollection services,
                                                        IConfiguration configuration,
                                                        IHostEnvironment? webHostEnvironment = null) {
            // configure console logging
            services.AddLogging(lb => {
                lb.AddConfiguration(configuration.GetSection("Logging"))
                  .AddConsole();
                if (configuration.GetValue("AddDiagnosticDebug", false))
                    lb.AddDebug();
            });
            services.AddSingleton(configuration);
            if (webHostEnvironment is null) {
                services.AddSingleton<IAppArguments, AppArguments>();
            }
            services.AddSingleton<IAppSupport, AppSupport>();
            services.AddSingleton<IConnectionRetriever, ConfigConnectionRetriever>();
            return services;
        }

        public static IServiceProvider ConfigureFAROSupport(this IServiceProvider serviceProvider, IConfiguration configuration) {
            var appArguments = serviceProvider.GetRequiredService<IAppArguments>();
            ((AppArguments)appArguments).ParseCommandLine();
            return serviceProvider;
        }

        public static IApplicationBuilder UseFAROSupport(this IApplicationBuilder appBuilder, IConfiguration configuration, IHostEnvironment? webHostEnvironment = null) => appBuilder;
    }

}
