
using System.Globalization;
using System.Text;

using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;

using FARO.Addons.Common.Extensions;
using FARO.Common;
using FARO.Common.Domain;
using FARO.Common.Helpers;

using FileIO = System.IO.File;
using static FARO.Addons.Common.DynamicHelper;
using static FARO.Addons.Common.StringHelper;

namespace FARO.Addons.File.Writers.Engine {
    public class ExcelWriterEngine : IWriterEngine {
        const string MIME_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        const string EXTENSION = "xlsx";

        private readonly IExpressionEvaluator _expressionEvaluator;

        public ExcelWriterEngine(IExpressionEvaluator expressionEvaluator) {
            _expressionEvaluator = expressionEvaluator;
        }

        public IEnumerable<FieldDescription> GetFields(WriterDefinition writerDefinition) {
            var config = writerDefinition.Config.As<ExcelConfig>();
            var ret = new HashSet<FieldDescription>();
            if (config?.Sheets != null) {
                foreach (var sheet in config.Sheets) {
                    if (sheet.Fields == null) continue;
                    foreach (var field in sheet.Fields) {
                        ret.Add(FieldDescription.Create(field.Name));
                        _expressionEvaluator.ForEachField(field.When, (f, o, a) => ret.Add(FieldDescription.Create(f, $"When: {field.When}")));
                    }
                }
            }
            return ret;
        }

        public void WriteAll(IWriter writer, IImageOutput output, IDataResourceService dataResource, IDictionary<string, object> args) => InternalWriteAll(writer, output, null, dataResource, args);

        public WriterStreamInfo WriteAllToStream(IWriter writer, IImageOutput output, WriterStream writerStream, IDataResourceService dataResource, IDictionary<string, object> args) => InternalWriteAll(writer, output, writerStream, dataResource, args);

        WriterStreamInfo InternalWriteAll(IWriter writer, IImageOutput output, WriterStream? writerStream, IDataResourceService dataResource, IDictionary<string, object> args) {
            var cfg = writer.Definition.Config.As<ExcelConfig>();
            var fileOut = args?.ContainsKey("file") ?? false ? MiscHelper.GetValueOrNull(args["file"]?.ToString()) : null;
            var culture = args?.ContainsKey("culture") ?? false ? MiscHelper.GetValueOrNull(args["culture"]?.ToString()) : null;
            var writerCulture = GetCulture(culture ?? cfg?.Culture);
            var fieldProg = new Dictionary<string, uint>();

            var templateFile = dataResource.GetResourcePath(cfg?.Template);
            if (!FileIO.Exists(templateFile)) throw new FileNotFoundException("Cannot find template!", cfg?.Template);
            SpreadsheetDocument? doc = null;
            if (writerStream?.InnerStream is null) {
                if (fileOut is not null) {
                    if (FileIO.Exists(fileOut)) FileIO.Delete(fileOut);
                    var outputFile = new FileInfo(templateFile).CopyTo(fileOut, true);
                    doc = SpreadsheetDocument.Open(outputFile.FullName, true);
                }
            } else {
                var templateData = FileIO.ReadAllBytes(templateFile);
                writerStream.InnerStream.Write(templateData, 0, templateData.Length);
                doc = SpreadsheetDocument.Open(writerStream.InnerStream, true);
            }
            if (doc == null) throw new NullReferenceException($"Cannot initialize excel document from template file: {cfg?.Template}");
            using (var excelFile = doc) {
                var wbPart = excelFile.WorkbookPart;
                if (wbPart is not null && cfg?.Sheets is not null) {
                    foreach (var configSheet in cfg.Sheets) {
                        if (!configSheet.Fields?.Any() ?? false) continue;
                        var sheet = wbPart.Workbook.Descendants<Sheet>().SingleOrDefault(s => s.Name == configSheet.Name) ?? throw new NullReferenceException($"Cannot find sheet by name: {configSheet.Name}");
                        if (sheet.Id is null) continue;
                        var worksheet = ((WorksheetPart)wbPart.GetPartById(sheet.Id!)).Worksheet;
                        var rowIndex = configSheet.StartRow;
                        var sheetData = worksheet.GetFirstChild<SheetData>();
                        if (sheetData is null) continue;
                        output?.IterateRows(row => CreateRow(writerCulture, sheetData, configSheet, row, rowIndex++, fieldProg));
                        worksheet.Save();
                    }
                    excelFile.Save();
                }
            }
            writerStream?.InnerStream?.Flush();
            return new WriterStreamInfo { ContentType = MIME_TYPE, FileName = fileOut, FileExtension = EXTENSION };
        }

        void CreateRow(CultureInfo writerCulture, SheetData sheetData, ExcelConfigSheet configSheet, ImageOutputRow row, uint rowIndex, Dictionary<string, uint> fieldProg) {
            foreach (var field in configSheet.Fields!.OrderBy(f => f.Column)) {
                // evaluate 'when' condition
                if (!MiscHelper.IsNullOrEmpty(field.When) && !_expressionEvaluator.EvalCondition(field.When, row)) continue;

                if (row.ContainsName(field.Name)) {
                    var fieldValue = row.GetValueExact(field.Name);

                    if (field.Type is not null) {
                        fieldValue = ChangeType(fieldValue, field.Type, writerCulture);
                    }

                    if (fieldValue is not null) {
                        var cellDataType = GetCellDataType(fieldValue);
                        var columnName = GetExcelColumnName(field.Column);
                        var cell = InsertCellInWorksheet(sheetData, columnName, rowIndex + (field.RowOffset ?? 0));
                        if (cellDataType == CellValues.Date)
                            cell.CellValue = new CellValue(((DateTime)fieldValue).ToString("yyyy-MM-dd"));
                        else {
                            var formattedValue = string.Format(writerCulture, "{0}", fieldValue);
                            if (field.Name is not null && !MiscHelper.IsNullOrEmpty(field.FieldProgPrependFormat)) {
                                if (!fieldProg.ContainsKey(field.Name)) fieldProg.Add(field.Name, 0);
                                var prependFieldIndexValue = ++fieldProg[field.Name];
                                formattedValue = string.Format(field.FieldProgPrependFormat!, prependFieldIndexValue) + formattedValue;
                            }
                            cell.CellValue = new CellValue(formattedValue);
                        }
                        cell.DataType = cellDataType;
                        cell.StyleIndex = GetCellStyleIndex(sheetData, columnName, configSheet.RowStyle);
                    }
                } else {
                    throw new ApplicationException($"Cannot find field name: {field.Name}");
                }
            }
        }

        #region Cell Helpers

        static uint GetCellStyleIndex(SheetData sheetData, string columnName, uint rowStyleIndex) {
            uint? styleIndex = null;
            var cell = sheetData.Elements<Row>().FirstOrDefault(r => r.RowIndex?.Equals(rowStyleIndex) ?? false)
                                ?.Elements<Cell>().FirstOrDefault(c => c.CellReference?.Value == columnName + rowStyleIndex);
            if (cell?.StyleIndex is not null) styleIndex = cell.StyleIndex;
            return styleIndex ?? 0;
        }

        static string GetExcelColumnName(uint columnIndex) {
            if (--columnIndex < 0) columnIndex = 0;

            if (columnIndex < 26)
                return ((char)('A' + columnIndex)).ToString();

            var firstChar = (char)('A' + (columnIndex / 26) - 1);
            var secondChar = (char)('A' + (columnIndex % 26));

            return string.Format("{0}{1}", firstChar, secondChar);
        }

        static double GetCellRefAsNumber(string cellReference) {
            var ret = new StringBuilder();
            foreach (var item in cellReference) {
                if (char.IsLetter(item)) ret.Append(item - 64);
                else ret.Append(item);
            }
            return double.Parse(ret.ToString());
        }

        static Cell InsertCellInWorksheet(SheetData sheetData, string columnName, uint rowIndex) {
            var cellReference = columnName + rowIndex;
            var row = sheetData.Elements<Row>().FirstOrDefault(r => r.RowIndex?.Equals(rowIndex) ?? false);
            if (row == null) {
                row = new Row { RowIndex = rowIndex };
                sheetData.Append(row);
            }
            var cell = row.Elements<Cell>().FirstOrDefault(c => c.CellReference?.Value == cellReference);
            if (cell == null) {
                Cell? refCell = null;
                foreach (var temp in row.Elements<Cell>()) {
                    if (temp?.CellReference?.Value is null) continue;
                    if (GetCellRefAsNumber(temp.CellReference.Value) > GetCellRefAsNumber(cellReference)) {
                        refCell = temp;
                        break;
                    }
                }

                var newCell = new Cell { CellReference = cellReference };
                row.InsertBefore(newCell, refCell);
                cell = newCell;
            }
            return cell;
        }

        static CellValues GetCellDataType(object fieldValue) {
            if (fieldValue != null) {
                if (fieldValue is DateTime) return CellValues.Date;
                if (fieldValue is int ||
                    fieldValue is double ||
                    fieldValue is long ||
                    fieldValue is decimal) return CellValues.Number;
            }
            return CellValues.String;
        }

        #endregion
    }
}
