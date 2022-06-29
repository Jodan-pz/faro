using FARO.Common;
using FARO.Common.Domain;

using Spectre.Console;
using Spectre.Console.Rendering;

namespace FARO.Services.Runners {

    internal static class NiceFlowTables {

        internal static IRenderable IntroductionTable(FlowItem item, IDictionary<string, object> imageArgs, IDictionary<string, object> writerArgs, int? keysLimit) {
            var tableArgs = new Table();
            tableArgs.Border(TableBorder.None);

            List<IRenderable> colArgs = new();

            if (imageArgs.Keys.Any()) {
                tableArgs.AddColumn("Image", c => c.Centered());
                var tableInputArgs = new Table().Expand();
                tableInputArgs.AddColumn("Key", c => c.RightAligned());
                tableInputArgs.AddColumn("Value", c => c.LeftAligned());
                foreach (var (key, val) in imageArgs) {
                    tableInputArgs.AddRow($"[yellow bold]{key}[/]", $"[cyan]{val}[/]");
                }
                colArgs.Add(tableInputArgs);
            }

            if (writerArgs.Keys.Any()) {
                tableArgs.AddColumn("Writer", c => c.Centered());
                var tableOutputArgs = new Table().Expand();
                tableOutputArgs.AddColumn("Key", c => c.RightAligned());
                tableOutputArgs.AddColumn("Value", c => c.LeftAligned());
                foreach (var (key, val) in writerArgs) {
                    tableOutputArgs.AddRow($"[LightPink1 bold]{key}[/]", $"[cyan3]{val}[/]");
                }
                colArgs.Add(tableOutputArgs);
            }

            tableArgs.AddRow(colArgs);

            var checkInfo = item.RunOptions.Check ? "[green]Yes[/]" : "[gray]No[/]";
            var persisterInfo = item.RunOptions.ImagePersister.Enabled ? item.RunOptions.ImagePersister.BuildStep ?? Emoji.Known.CheckMark : "[gray]None[/]";
            var keysLimitInfo = keysLimit is not null ? $"[green]{keysLimit}[/]" : "[gray]None[/]";

            var tableOptions = new Table();
            tableOptions.AddColumn("Check", c => c.Alignment(Justify.Center));
            tableOptions.AddColumn("Persister", c => c.Alignment(Justify.Center));
            tableOptions.AddColumn("Limit", c => c.Alignment(Justify.Center));
            tableOptions.AddRow(checkInfo, persisterInfo, keysLimitInfo);

            var table = new Table();
            table.AddColumn($"FLOW[cyan] {item.Definition.Name}[/]", c => c.Alignment(Justify.Center).NoWrap());
            if (tableArgs.Columns.Count > 0) {
                table.AddRow(tableArgs.Expand());
            }
            table.AddRow(tableOptions.Expand());

            return table.Expand();
        }

        internal static IRenderable CheckResultTable(CheckResultCollection checkResult) {
            var tableCheck = new Table();
            tableCheck.Title = new TableTitle("Check", new Style(Color.Yellow2));
            tableCheck.AddColumn("Area", c => c.Centered());
            tableCheck.AddColumn("Message", c => c.Centered());
            tableCheck.AddColumn("Value", c => c.Centered());
            tableCheck.Border(TableBorder.Square);
            foreach (var ck in checkResult.Items) {
                var rowCol = ck.Level switch
                {
                    CheckResultLevel.Error => Color.Red3_1,
                    CheckResultLevel.Warning => Color.Yellow3_1,
                    _ => Color.Grey82
                };
                var txtArea = new Text(ck.Area.ToString(), new Style(rowCol));
                var txtMessage = new Text(ck.Message, new Style(rowCol));
                var txtId = new Text(ck.Id ?? " - ", new Style(rowCol));
                tableCheck.AddRow(txtArea, txtMessage, txtId);
            }
            return tableCheck.Expand();
        }

        internal static IRenderable ValidationTable(ValidatorResult validate) {
            var firstTen = validate.Count() > 10;
            var tableValidator = new Table();
            tableValidator.Title = new TableTitle($"Validation {(firstTen ? "(first 10)" : "")}", new Style(Color.Yellow2));
            tableValidator.AddColumn("Validator", c => c.Centered());
            tableValidator.AddColumn("Context", c => c.Centered());
            tableValidator.AddColumn("Key", c => c.Centered());
            tableValidator.AddColumn("Message", c => c.Centered());
            tableValidator.Border(TableBorder.Square);

            foreach (var val in validate.Where(v => !v.IsGenericErrorRawValues).Take(10)) {
                tableValidator.AddRow(val.Validator.Definition.Name,
                                      val.Context ?? "[gray]-[/]",
                                      val.Key ?? "[gray]-[/]",
                                      val.Message ?? "[gray]-[/]"
                                      );
            }
            return tableValidator.Expand();
        }

        internal static IRenderable SummaryTable(IDictionary<string, TimeSpan?> timings) {
            var tableSummary = new Table();
            tableSummary.AddColumn("Step", c => c.RightAligned());
            tableSummary.AddColumn("Time", c => c.LeftAligned());
            tableSummary.Border(TableBorder.MinimalDoubleHead);
            TimeSpan tot = new();
            foreach (var (key, val) in timings) {
                var itemElapsed = val?.TotalSeconds >= 1 ? val.Value.ToString(@"hh\:mm\:ss\.ff") : "[gray]-[/]";
                tableSummary.AddRow($"[Lime]{key.ToUpper()}[/]", itemElapsed);
                if (val is not null)
                    tot = tot.Add(val.Value);
            }
            tableSummary.AddEmptyRow();
            tableSummary.AddRow("[yellow bold]Total[/]", "[bold]" + tot.ToString(@"hh\:mm\:ss") + "[/]");
            return tableSummary.Expand();
        }
    }
}
