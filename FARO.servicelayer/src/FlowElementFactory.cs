using System;
using System.Collections.Generic;

using FARO.Common;
using FARO.Common.Domain;

namespace FARO.Services {
    public class FlowElementFactory : IFlowElementFactory {
        private readonly IImageFactory _imageFactory;
        private readonly IEngineFactory _engineFactory;

        public FlowElementFactory(IEngineFactory engineFactory, IImageFactory imageFactory) {
            _engineFactory = engineFactory ?? throw new ArgumentNullException(nameof(engineFactory));
            _imageFactory = imageFactory ?? throw new ArgumentNullException(nameof(imageFactory));
        }

        public IEngineFactory Engined => _engineFactory;

        // wrap createImage from imageFactory
        public IImage CreateImage(ImageDefinition definition,
                                  IDictionary<string, KeysIteratorDefinition> keysIterators,
                                  IDictionary<string, DecoratorDefinition> decorators) {
            return _imageFactory.CreateImage(definition, _engineFactory, keysIterators, decorators);
        }
    }
}