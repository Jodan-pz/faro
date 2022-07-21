using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FARO.Common;
using FARO.Common.Domain;

namespace FARO.Services.Decorators {
    public class Decorator : IDecorator {
        private readonly IDecoratorEngine _engine;
        private readonly IDataResourceService _dataResourceService;
        private readonly DecoratorDefinition _definition;
        private readonly Lazy<IEnumerable<ArgumentValue>> _arguments;
        private readonly string _map;

        public Decorator(DecoratorDefinition definition,
                         IDecoratorEngine engine = null,
                         IDictionary<string, object> args = null,
                         string map = null,
                         IDataResourceService dataResource = null) {

            _definition = definition;
            _engine = engine;
            _arguments = new(() => CreateArguments(args));
            _map = map;
            _dataResourceService = dataResource;
        }

        public IEnumerable<ArgumentValue> Arguments => _arguments.Value;
        public DecoratorDefinition Definition => _definition;
        public string HashKey => Arguments.Aggregate($"{Definition.Id}_DECARGS_", (a, c) => a + "|" + c.Name + "|" + c.Value);
        public string Map => _map;
        public Task<IDictionary<string, object>> GetValuesAsync(ImageOutputRow imageOutputRow) => _engine?.GetValuesAsync(this, imageOutputRow, _dataResourceService);

        public override string ToString() {
            var sb = new StringBuilder();
            sb.AppendLine($"{Definition.Id} {Definition.Name} {Definition.Description}");
            sb.AppendLine($"Data path: {_dataResourceService}");
            sb.AppendLine($"Map to: {Map}");
            if (Definition.Arguments != null) {
                sb.AppendLine("--- Arguments ---");
                foreach (var arg in Definition.Arguments) sb.AppendLine(arg.ToString());
            }
            if (Definition.Fields != null) {
                sb.AppendLine("--- Output fields ---");
                foreach (var outField in Definition.Fields) sb.AppendLine(outField.ToString());
            }
            return sb.ToString();
        }

        /// <summary>
        /// Retrieve decorator argument values
        /// </summary>
        /// <param name="definition">Decorator definition</param>
        /// <param name="args">Arguments dictionary values</param>
        /// <returns>Enumeration of argument values for a decorator</returns>
        protected virtual IEnumerable<ArgumentValue> CreateArguments(IDictionary<string, object> args) {
            // crate argument values
            var argValues = new List<ArgumentValue>();
            if (Definition.Arguments != null) {
                foreach (var arg in Definition.Arguments) {
                    var value = (args?.ContainsKey(arg.Name) ?? false) ? args[arg.Name] : null;
                    argValues.Add(new ArgumentValue(arg, value));
                }
            }
            return argValues;
        }
    }
}
