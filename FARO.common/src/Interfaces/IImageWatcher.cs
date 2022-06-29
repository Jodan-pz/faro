using FARO.Common.Domain;

namespace FARO.Common {
    public interface IImageWatcher {
        void Clear(ImageDefinition image);
        void StartDecorator(ImageDefinition image, ILayer layer, IDecorator decorator);
        void StopDecorator(ImageDefinition image, ILayer layer, IDecorator decorator);

        ImageWatcherItem GetWatcherItem(ImageDefinition image, ILayer layer, IDecorator decorator);
        void SetField(ImageDefinition image, ILayer layer, IDecorator decorator, string fieldName);
    }
}