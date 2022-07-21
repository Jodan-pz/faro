using System;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

using FARO.Batch.Extensions.DependecyInjection;
using FARO.Common;
using FARO.Extensions.DependencyInjection;

using Lamar;

namespace FARO.Batch {
    /// <summary>
    /// FARO implementation
    /// </summary>
    public static class Program {
        public static void Main(string[] args) {
            var exitCode = 0;
            try {
                using var container = InitApp(out IFAROBatch app);
                app.Start(args);
            } catch (Exception ex) {
                exitCode = 99;
                ShowError(ex);
            } finally {
                ShowMessage(string.Format("Exit Code: {0}", exitCode));
            }
            Environment.Exit(exitCode);
        }

        #region Private
        static ILogger log;

        static void ShowError(Exception exception) {
            if (log != null)
                log.LogError(exception.Message);
            else
                Console.WriteLine($"{DateTime.Now:yyyy-MM-dd HH:mm:ss} ERROR: {exception.Message}");
        }

        static void ShowMessage(string message) {
            if (log != null)
                log.LogInformation(message);
            else
                Console.WriteLine($"{DateTime.Now:yyyy-MM-dd HH:mm:ss} {message}");
        }

        static IContainer InitApp<T>(out T mainService) {
            var builder = new ConfigurationBuilder()
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{Environment.MachineName}.json", optional: true, reloadOnChange: true);

            var configuration = builder.Build();

            var svcCollection = new ServiceRegistry();

            // Add FARO support 
            svcCollection.AddFAROSupport(configuration);

            // Add FARO registrations
            svcCollection.AddFARO(configuration);

            var container = new Container(svcCollection);

            // Create Service Provider
            var serviceProvider = container.ServiceProvider;

            // Set current Program Logger
            log = serviceProvider.GetService<ILogger<T>>();

            // configure support
            try {
                serviceProvider.ConfigureFAROSupport(configuration);
            } catch (Exception ex) {
                ShowError(ex);
                Environment.Exit(99);
            }

            // Get Main service from configured container
            mainService = container.GetRequiredService<T>();
            return container;
        }
        #endregion
    }
}
