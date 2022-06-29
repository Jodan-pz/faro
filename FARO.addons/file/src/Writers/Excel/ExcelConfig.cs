namespace FARO.Addons.File.Writers {
    class ExcelConfig {
        public string? Culture { get; set; }
        public ExcelConfigSheet[]? Sheets { get; set; }
        public string? Template { get; set; }
    }
}