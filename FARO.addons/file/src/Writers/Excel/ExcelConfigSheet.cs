namespace FARO.Addons.File.Writers {
    class ExcelConfigSheet {
        public string? Name { get; set; }
        public uint StartRow { get; set; }
        public uint RowStyle { get; set; }

        public ExcelConfigSheetField[]? Fields { get; set; }
    }
}