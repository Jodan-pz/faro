using System;
using FARO.Common.Domain;
namespace FARO.Common {

    public delegate CheckResultCollection CheckerDelegate(string id);

    public interface IIntegrityCheckService {
        CheckResultCollection CheckFlowItem(string flowId);
        CheckResultCollection CheckImage(string imageId);

        (CheckerDelegate checkValidator, CheckerDelegate checkWriter) CreateChecker(string imageId, string aggregatorId = null);
    }
}
