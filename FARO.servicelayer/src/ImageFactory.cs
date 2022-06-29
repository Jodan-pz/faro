using System;
using System.Collections.Generic;

using FARO.Common;
using FARO.Common.Domain;

namespace FARO.Services {
    public class ImageFactory : IImageFactory {
        readonly IExpressionEvaluator _expressionEvaluator;
        readonly IImageWatcher _imageWatcher;

        public ImageFactory(IExpressionEvaluator expressionEvaluator, IImageWatcher imageWatcher = null) {
            _expressionEvaluator = expressionEvaluator ?? throw new ArgumentNullException(nameof(expressionEvaluator));
            _imageWatcher = imageWatcher;
        }

        public IImage CreateImage(ImageDefinition definition,
                                  IEngineFactory engineFactory,
                                  IDictionary<string, KeysIteratorDefinition> keysIterators,
                                  IDictionary<string, DecoratorDefinition> decorators) {
            if (definition == null) throw new ArgumentNullException(nameof(definition));

            var resolver = new ImageItemResolver(engineFactory, keysIterators, decorators);
            return new Image(definition, resolver, _expressionEvaluator, _imageWatcher);
        }
    }
}