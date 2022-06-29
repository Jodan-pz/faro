namespace FARO.Services.ImagePersister {
    internal enum BuildStep { Row, Aggregator, Last }
    internal record BuildLayerStep(string LayerName);
}
