using System.Collections.Generic;

using FARO.Common.Domain;

namespace FARO.Common {

    public interface IFlowItemImagePersister {
        IImageOutput Init(FlowItem flowItem, IDictionary<string, object> imageArgs);

        FlowItemImagePersisterState GetPersisterState(FlowItem flowItem, IDictionary<string, object> imageArgs);

        void Flush();
    }
}
