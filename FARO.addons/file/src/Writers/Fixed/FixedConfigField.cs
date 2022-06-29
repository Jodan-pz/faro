namespace FARO.Addons.File.Writers {
    class FixedConfigField {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Format { get; set; }
        public string? Type { get; set; }
        public string? When { get; set; }
        public int Start { get; set; }
        public int Length { get; set; }
        public double VirtualDec { get; set; }
    }
}