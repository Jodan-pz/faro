namespace FARO.Addons.File.Writers {
    class DelimitedConfig {
        public char? Delim { get; set; }
        public string? Culture { get; set; }
        public string? Encoding { get; set; }
        public bool? IncludeHeader { get; set; }
        public DelimitedConfigField[]? Fields { get; set; }
    }
}