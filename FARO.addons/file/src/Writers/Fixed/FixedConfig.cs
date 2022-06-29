namespace FARO.Addons.File.Writers {
    class FixedConfig {
        public string? Culture { get; set; }
        public string? Encoding { get; set; }
        public int Length { get; set; }
        public FixedConfigField[]? Fields { get; set; }
    }
}