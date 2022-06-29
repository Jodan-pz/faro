using FARO.Common;
using Microsoft.Extensions.Configuration;

namespace FARO.Support {

    public class AppSupport : IAppSupport {
        private readonly IConfiguration _config;
        private readonly IAppArguments? _appArguments;
        private const string SUPPORT_SECTION = "FARO:Support";

        public AppSupport(IConfiguration config, IAppArguments? appArguments = null) {
            _config = config ?? throw new ArgumentNullException(nameof(config));
            _appArguments = appArguments;
        }

        private IConfigurationSection SupportSection => _config.GetSection(SUPPORT_SECTION);

        public (string Server, string Database, string? User, string? Password)? FARODB => GetSupportDb("FARO");

        public (string Server, string Database, string? User, string? Password)? IMAGEPERSISTERDB => GetSupportDb("IMAGEPERSISTER");

        public (string Server, string Database, string? User, string? Password)? CACHEDB => GetSupportDb("CACHE");

        public string KeysIteratorsDataRootPath => SupportSection.GetValue<string>("KeysIteratorsDataRootPath");

        public string DecoratorsDataRootPath => SupportSection.GetValue<string>("DecoratorsDataRootPath");

        public string AggregatorsDataRootPath => SupportSection.GetValue<string>("AggregatorsDataRootPath");

        public string ValidatorsDataRootPath => SupportSection.GetValue<string>("ValidatorsDataRootPath");

        public string WritersDataRootPath => SupportSection.GetValue<string>("WritersDataRootPath");

        public string JsonFileDefinitionDataRootPath => SupportSection.GetValue<string>("JsonFileDefinitionDataRootPath");

        public IAppArguments? Arguments => _appArguments;

        private (string Server, string Database, string? User, string? Password)? GetSupportDb(string name) {
            var db = SupportSection.GetSection($"{name}DB");
            return (db.GetValue<string>("server"),
                    db.GetValue<string>("database"),
                    db.GetValue<string?>("user"),
                    db.GetValue<string?>("password")
                    );
        }
    }
}
