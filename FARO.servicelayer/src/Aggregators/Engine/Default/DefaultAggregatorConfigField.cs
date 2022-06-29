namespace FARO.Services.Aggregators.Engine.Default {
    public class DefaultAggregatorConfigField {
        public string Name { get; set; }

        public DefaultAggregatorFunction Function { get; set; }

        public override string ToString() => $"{Name} -> {Function}";
    }
}
