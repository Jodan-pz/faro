namespace FARO.Common {
    public interface IAppSupport {
        (string Server, string Database, string User, string Password)? FARODB { get; }
        (string Server, string Database, string User, string Password)? IMAGEPERSISTERDB { get; }
        (string Server, string Database, string User, string Password)? CACHEDB { get; }
        string KeysIteratorsDataRootPath { get; }
        string DecoratorsDataRootPath { get; }
        string AggregatorsDataRootPath { get; }
        string ValidatorsDataRootPath { get; }
        string WritersDataRootPath { get; }
        string JsonFileDefinitionDataRootPath { get; }
        IAppArguments Arguments { get; }
    }
}
