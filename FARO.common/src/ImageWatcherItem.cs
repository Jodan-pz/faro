using System;
using FARO.Common.Domain;

namespace FARO.Common {
    public class ImageWatcherItem {
        public ImageDefinition Image { get; set; }
        public ILayer Layer { get; set; }
        public IDecorator Decorator { get; set; }
        public DateTime Start { get; set; }
        public DateTime Stop { get; set; }
        public string FieldName { get; set; }

        public override string ToString() => $"Image: {Image.Name} - Layer: {Layer.Name} - Field: {FieldName} - Decorator: {Decorator.Definition.Name} ({Convert.ToUInt32((Stop - Start).TotalSeconds)} secs)";
    }
}