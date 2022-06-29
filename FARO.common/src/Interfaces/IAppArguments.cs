namespace FARO.Common {
    public interface IAppArguments {
        string FlowId { get; }
        string FlowName { get; }
        string InputArgs { get; }
        string OutputArgs { get; }
        bool? EnableCheck { get; }
        bool? EnablePersister { get; }
        string PersisterBuildStep { get; }
    }
}