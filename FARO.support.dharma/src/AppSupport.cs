using DHARMA.Domain;
using DHARMA.Jacob.CommonUtils;

using FARO.Common;

namespace FARO.Dharma.Support {

    public sealed class AppArguments : IAppArguments {
        public string? FlowId { get; set; }
        public string? FlowName { get; set; }
        public string? InputArgs { get; set; }
        public string? OutputArgs { get; set; }
        public bool? EnableCheck { get; set; }
        public bool? EnablePersister { get; set; }
        public string? PersisterBuildStep { get; set; }
    }

    public class AppSupport : IAppSupport {
        public DharmaConnection? DHARMA_FARODB { get; set; }
        public DharmaConnection? DHARMA_CACHEDB { get; set; }
        public DharmaConnection? DHARMA_IMAGEPERSISTERDB { get; set; }

        public (string Server, string Database, string? User, string? Password)? FARODB => GetSupportDb(DHARMA_FARODB);
        public (string Server, string Database, string? User, string? Password)? CACHEDB => GetSupportDb(DHARMA_CACHEDB);
        public (string Server, string Database, string? User, string? Password)? IMAGEPERSISTERDB => GetSupportDb(DHARMA_IMAGEPERSISTERDB);
        public string? KeysIteratorsDataRootPath { get; set; }
        public string? DecoratorsDataRootPath { get; set; }
        public string? ValidatorsDataRootPath { get; set; }
        public string? AggregatorsDataRootPath { get; set; }
        public string? WritersDataRootPath { get; set; }
        public string? JsonFileDefinitionDataRootPath { get; set; }
        public IAppArguments Arguments { get; set; } = new AppArguments();

        private static (string Server, string Database, string? User, string? Password)? GetSupportDb(DharmaConnection? connection) {
            if (connection?.Server == null) return null;
            return (connection.Server,
                    connection.Catalog,
                    connection.User,
                    connection.SecuredData != null ? CryptHelper.Decryptor(connection.SecuredData) : null);
        }
    }
}
