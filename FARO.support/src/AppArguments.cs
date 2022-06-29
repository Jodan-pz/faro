using CommandLine;
using FARO.Common;

namespace FARO.Support {

    public class AppArguments : IAppArguments {
        private CommandLineAppArguments _commandLineAppArguments = new();

        private static T? GetArgValue<T>(string name) {
            var envVal = Environment.GetEnvironmentVariable($"EAX_ARG_{name.ToUpper()}");
            if (envVal is null) return default;
            var type = typeof(T);
            var typeCast = Nullable.GetUnderlyingType(type) ?? type;
            return (T)Convert.ChangeType(envVal, typeCast);
        }

        public string? FlowId => GetArgValue<string>("Flow_Id");

        public string? FlowName => _commandLineAppArguments.FlowName ?? GetArgValue<string>("Flow_Name");

        public string? InputArgs => _commandLineAppArguments.InputArgs ?? GetArgValue<string>("Input_Args");

        public string? OutputArgs => _commandLineAppArguments.OutputArgs ?? GetArgValue<string>("Output_Args");

        public bool? EnableCheck => _commandLineAppArguments.EnableCheck || GetArgValue<bool>("Enable_Check");

        public bool? EnablePersister => _commandLineAppArguments.EnablePersister || GetArgValue<bool>("Enable_Persister");

        public string? PersisterBuildStep => _commandLineAppArguments.PersisterBuildStep ?? GetArgValue<string>("Persister_Build_Step");

        public void ParseCommandLine() {

            var parser = new Parser(s => {
                s.HelpWriter = null;
                s.AutoHelp = true;
                s.AutoVersion = true;
                s.EnableDashDash = true;
            });

            var envVars = Environment.GetEnvironmentVariables().Keys.OfType<string>().Any(x => x.StartsWith("EAX_ARG_FLOW_"));

            var pr = parser.ParseArguments<CommandLineAppArguments>(Environment.GetCommandLineArgs().Skip(1));

            pr.WithParsed(o => {
                if (!envVars && o.FlowName is null) {
                    var prhelp = parser.ParseArguments<CommandLineAppArguments>(new[] { "--help" });
                    var helpText = CommandLine.Text.HelpText.AutoBuild(prhelp);
                    Console.WriteLine(helpText);
                    System.Environment.Exit(0);
                }
                _commandLineAppArguments = o;
            })
            .WithNotParsed(e => {
                var helpText = CommandLine.Text.HelpText.AutoBuild(pr);
                if (e.IsHelp() || e.IsVersion()) {
                    Console.WriteLine(helpText);
                    System.Environment.Exit(0);
                } else if (!envVars) {
                    Console.WriteLine(helpText);
                    Console.WriteLine("No command line arguments were passed.\nPlease use the EAX_ARG_* environment variables or command line arguments.");
                    System.Environment.Exit(0);
                }
            });
        }
    }

    class CommandLineAppArguments {
        [Value(0, MetaName = "name", Required = false, HelpText = "Flow name.")]
        public string? FlowName { get; set; }

        [Option('i', "input", Required = false, HelpText = "Flow input arguments.")]
        public string? InputArgs { get; set; }

        [Option('o', "output", Required = false, HelpText = "Flow output arguments.")]
        public string? OutputArgs { get; set; }

        [Option('c', "check", Default = false, Required = false, HelpText = "Enable flow check.")]
        public bool EnableCheck { get; set; }

        [Option('p', "persister", Default = false, Required = false, HelpText = "Enable flow image persister.")]
        public bool EnablePersister { get; set; }

        [Option('s', "persister-step", Required = false, HelpText = "Flow image persister build step.")]
        public string? PersisterBuildStep { get; set; }
    }

}
