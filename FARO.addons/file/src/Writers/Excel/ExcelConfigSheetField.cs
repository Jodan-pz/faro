namespace FARO.Addons.File.Writers {
    class ExcelConfigSheetField {
        public uint Column { get; set; }
        public uint? RowOffset { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Type { get; set; }
        public string? When { get; set; }
        public string? FieldProgPrependFormat { get; set; }
    }
}