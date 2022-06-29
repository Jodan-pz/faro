namespace FARO.Common {
    public interface IDataResourceService {
        bool ExistResource(string resourceName);
        string GetResourcePath(string resourceName);
    }
}