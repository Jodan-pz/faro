using System;
using System.Collections.Generic;
using System.IO;

using FARO.Common;
using FARO.Common.Domain;

using Newtonsoft.Json;

namespace FARO.Test.ImagePersisters {

    public class JsonFileImagePersister : IFlowItemImagePersister {
        readonly string _jsonFile;

        public JsonFileImagePersister(string jsonFile) {
            _jsonFile = jsonFile ?? throw new ArgumentNullException(nameof(jsonFile));
        }

        public FlowItemImagePersisterState GetPersisterState(FlowItem flowItem, IDictionary<string, object> imageArgs) {
            throw new NotImplementedException();
        }

        public void Flush() {
            throw new NotImplementedException();
        }

        public IImageOutput Init(FlowItem flowItem, IDictionary<string, object> imageArgs) {
            if (flowItem.RunOptions.ImagePersister?.Enabled ?? false) {
                var output = new ImageOutput(
                        JsonConvert.DeserializeObject<IDictionary<string, object>[]>(
                            File.ReadAllText(_jsonFile)
                            ), row => row.Discard = false);
                flowItem.Image.Definition.KeysIterators = null;
                flowItem.Image.Definition.Layers = null;
                return output;
            }
            return null;
        }
    }
}
