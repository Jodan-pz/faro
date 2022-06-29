using FARO.Addons.Common.Extensions;
using FARO.Common;
using FARO.Common.Domain;

namespace FARO.Addons.Multi.Validators.Engine {
    public class MultiValidatorEngine : IValidatorEngine {
        private readonly IEngineFactory _engineFactory;
        private readonly IDefinitionDataService _definitionDataService;

        public MultiValidatorEngine(IEngineFactory engineFactory, IDefinitionDataService definitionDataService) {
            _engineFactory = engineFactory ?? throw new System.ArgumentNullException(nameof(engineFactory));
            _definitionDataService = definitionDataService ?? throw new System.ArgumentNullException(nameof(definitionDataService));
        }

        public IEnumerable<FieldDescription> GetFields(ValidatorDefinition validatorDefinition) {
            var ret = new HashSet<FieldDescription>();
            var cfg = validatorDefinition.Config?.As<MultiValidatorConfig>();
            if (cfg?.Validators is null) return ret;
            foreach (var validatorMap in cfg.Validators) {
                var validatorDef = _definitionDataService.GetValidator(validatorMap.Id);
                var validator = _engineFactory.CreateValidator(validatorDef);
                var fields = validator.GetFields();
                if (fields is null) continue;
                foreach (var field in fields)
                    ret.Add(field);
            }
            return ret;
        }

        public ValidatorResult Validate(IValidator validator, IImageOutput imageOutput, IDataResourceService dataResource) {
            ValidatorResult ret = new();
            var cfg = validator.Definition.Config?.As<MultiValidatorConfig>();
            if (cfg?.Validators is null) return ret;
            List<ValidatorResult> results = new();
            List<(IValidator Validator, ValidatorConfig Config)> items = new();
            foreach (var validatorConfig in cfg.Validators) {
                var validatorDef = _definitionDataService.GetValidator(validatorConfig.Id);
                items.Add((
                    _engineFactory.CreateValidator(validatorDef),
                    validatorConfig)
                    );
            }
            ParallelOptions parallelOptions = new();
            CancellationTokenSource cts = new();
            parallelOptions.CancellationToken = cts.Token;
            try {
                Parallel.ForEach(items, parallelOptions, item => {
                    var validate = item.Validator.Validate(imageOutput);
                    results.Add(validate);
                    if (!validate.Valid && (item.Config.FailFast || cfg.FailFast)) {
                        cts.Cancel(true);
                    }
                });
            } catch (OperationCanceledException) {/* token raised nothing to do, just move forward */ }

            foreach (var val in results) ret.AddResult(val);
            return ret;
        }
    }
}