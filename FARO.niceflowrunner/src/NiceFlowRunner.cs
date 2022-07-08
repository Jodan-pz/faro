using System.Diagnostics;
using System.Reflection;

using FARO.Common;
using FARO.Common.Domain;
using FARO.Common.Helpers;

using Spectre.Console;

using static FARO.Common.Constants;
using static FARO.Services.Runners.NiceFlowTables;

namespace FARO.Services.Runners {
    public class NiceFlowRunner : IFlowRunner {
        const int DEFAULT_STATUS_SLEEP = 200;
        private readonly IFlowItemImagePersister? _imagePersister;
        private readonly IIntegrityCheckService? _checkService;

        public NiceFlowRunner(IFlowItemImagePersister? imagePersistrer = null,
                              IIntegrityCheckService? checkService = null) {
            _imagePersister = imagePersistrer;
            _checkService = checkService;
        }

        public WriterStreamInfo? Run(FlowItem item, Stream? outputStream, IDictionary<string, object> imageArgs, IDictionary<string, object> writerArgs, int? keysLimit) {
            try {
                return InternalRun(item, outputStream, imageArgs, writerArgs, keysLimit);
            } catch (Exception ex) {
                if (ex is not ApplicationException) {
                    AnsiConsole.WriteException(ex);
                }
                /* rethrow */
                throw;
            }
        }

        public void Run(FlowItem item, IDictionary<string, object> imageArgs, IDictionary<string, object> writerArgs, int? keysLimit) {
            try {
                InternalRun(item, null, imageArgs, writerArgs, keysLimit);
            } catch (Exception ex) {
                if (ex is not ApplicationException) {
                    AnsiConsole.WriteException(ex);
                }
                /* rethrow */
                throw;
            }
        }

        private WriterStreamInfo? InternalRun(FlowItem item, Stream? outputStream, IDictionary<string, object> imageArgs, IDictionary<string, object> writerArgs, int? keysLimit = null) {
            if (item == null) return null;
            WriterStreamInfo? ret = null;
            ProgressTask? currentIteratorTask = null;
            Timings timings = new();
            Stopwatch sw = new();
            IImageOutput? output = null;

            var onIterate = (ImageOutputRow row) => currentIteratorTask?.Increment(1);
            var version = new Rule($"[yellow]FARO[/] v.[LightGreen_1]{Assembly.GetEntryAssembly()?.GetName().Version}[/]").RightAligned();

            AnsiConsole.Clear();
            AnsiConsole.Write(version);
            AnsiConsole.Write(IntroductionTable(item, imageArgs, writerArgs, keysLimit));

            AnsiConsole.Status().Start($"Warming up...", ctx => {
                Thread.Sleep(DEFAULT_STATUS_SLEEP);

                if (item.RunOptions.Check) {
                    CheckResultCollection? checkResult = null;
                    ctx.Spinner(Spinner.Known.Dots);
                    ctx.SpinnerStyle(Style.Parse("yellow"));
                    ctx.Status("[white]Checking...[/]");
                    Thread.Sleep(DEFAULT_STATUS_SLEEP);
                    sw.Start();
                    checkResult = _checkService?.CheckFlowItem(item.Definition.Id);
                    sw.Stop();
                    timings.AddCheck(sw.Elapsed);
                    var res = (checkResult?.HasErrors ?? false) ? "[red]KO[/]" : "[green]OK[/]";
                    ctx.Status($"Checking {res}");
                    Thread.Sleep(DEFAULT_STATUS_SLEEP);
                    if (checkResult?.HasErrors ?? false) {
                        AnsiConsole.Write(CheckResultTable(checkResult));
                        throw new ApplicationException("Flow check error(s) occoured!");
                    }
                }

                ctx.Status("Persister...");
                ctx.Spinner(Spinner.Known.Bounce);
                ctx.SpinnerStyle(Style.Parse("yellow"));
                Thread.Sleep(DEFAULT_STATUS_SLEEP);
                sw.Restart();
                output = _imagePersister?.Init(item, imageArgs) ?? new ImageOutput();
                sw.Stop();
                timings.AddPersister(sw.Elapsed);
                output.OnIterate = onIterate;
                ctx.Status("Persister [green]" + Emoji.Known.CheckMark + "[/]");
                Thread.Sleep(DEFAULT_STATUS_SLEEP);

                ctx.Status("Schema...");
                ctx.Spinner(Spinner.Known.Default);
                Thread.Sleep(DEFAULT_STATUS_SLEEP);
                sw.Restart();
                item.Image?.BuildSchema();
                sw.Stop();
                timings.AddSchema(sw.Elapsed);
                ctx.Status("Schema [green]" + Emoji.Known.CheckMark + "[/]");
                Thread.Sleep(DEFAULT_STATUS_SLEEP);

                ctx.Status("Keys...");
                ctx.Spinner(Spinner.Known.Dots);
                Thread.Sleep(DEFAULT_STATUS_SLEEP);
                sw.Restart();
                item.Image?.IterateKeys(imageArgs, key => {
                    output.AddKey(key);
                    ctx.Status("Keys... " + sw.Elapsed.ToString(@"hh\:mm\:ss"));
                    return (keysLimit ?? 0) <= 0 || output.Size < keysLimit;
                });
                sw.Stop();
                timings.AddKeys(sw.Elapsed);
            });

            if (output is null) return ret;

            AnsiConsole.Progress()
                       .HideCompleted(true)
                       .Columns(new ProgressColumn[]{
                                new SpinnerColumn(),
                                new TaskDescriptionColumn(),
                                new ProgressBarColumn(),
                                new PercentageColumn(),
                                new ElapsedTimeColumn{ Style = new Style(Color.White)}
                               }).Start(ctx => {
                                   var task = ctx.AddTask("[white]Building Image[/]").MaxValue(output.Size);
                                   currentIteratorTask = task;
                                   task.StartTask();
                                   ParallelHelper.ForEach(output.Partitioner(DEFAULT_PART_CHUNK_SIZE), row => {
                                       item.Image?.EvalLayers(row);
                                       task.Increment(1);
                                   });
                                   timings.AddImage(task.ElapsedTime);

                                   task.Value = 0;
                                   task.MaxValue = output.Size;
                                   task.Description = "[cyan3]Validating[/]";
                                   var validate = item.Validator?.Validate(output);
                                   if (validate != null && !validate.Valid) {
                                       AnsiConsole.Write(ValidationTable(validate));
                                       throw new ApplicationException("Flow validator error(s) occoured!");
                                   }
                                   timings.OnValidator(task.ElapsedTime);

                                   task.Value = 0;
                                   task.MaxValue = output.Size;
                                   task.Description = "[yellow]Aggregating[/]";
                                   output = item.Aggregator?.Aggregate(output) ?? output;
                                   timings.OnAggregator(task.ElapsedTime);

                                   task.Value = 0;
                                   task.MaxValue = output.Size;
                                   task.Description = "[cyan]Writing[/]";
                                   if (outputStream != null) {
                                       ret = item.Writer?.WriteToStream(output, new WriterStream(outputStream), writerArgs);
                                   } else {
                                       item.Writer?.Write(output, writerArgs);
                                   }
                                   timings.OnWriter(task.ElapsedTime);
                               });

            AnsiConsole.Write(SummaryTable(timings.Values));

            return ret;
        }
    }
}
