using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Reflection;

using Microsoft.Extensions.Logging;

using FARO.Common;
using FARO.Common.Domain;
using FARO.DataLayer.MongoDb;
using FARO.Expression;
using FARO.Services;
using FARO.Services.Aggregators.Engine;
using FARO.Services.Decorators.Engine;
using FARO.Services.KeysIterators.Engine;
using FARO.Services.Runners;
using FARO.Services.Validators.Engine;
using FARO.Services.Writers.Engine;
using FARO.Test.ImagePersisters;

using Newtonsoft.Json;

using Xunit;

using Yoda.Common.Interfaces;
using Yoda.Common.UnitOfWork;
using Yoda.MongoDb;

namespace FARO.Test.BaseClasses {

    #region Configuration mapping classes
    class DocumentConnection {
        public string Host { get; set; }
        public int Port { get; set; }
        public string User { get; set; }
        public string Pwd { get; set; }
        public string Database { get; set; }
    }

    class DocumentDbConfiguration {
        public string Current { get; set; } = null;
        public IDictionary<string, DocumentConnection> Connections { get; set; }

        internal DocumentConnection GetCurrentConnection() {
            if (Connections?.ContainsKey(Current) ?? false) {
                return Connections[Current];
            }
            throw new ArgumentException($"Configuration Error. Cannot find '{Current}' (Current) connection in 'Connections' section!");
        }
        internal static DocumentDbConfiguration Load() {
            var location = typeof(DocumentDbConfiguration).GetTypeInfo().Assembly.Location;
            var dirPath = Path.GetDirectoryName(location);

            var curFile = Path.Combine(dirPath, $"mongodb.config.json");
            DocumentDbConfiguration config = null;
            if (File.Exists(curFile)) {
                config = JsonConvert.DeserializeObject<DocumentDbConfiguration>(File.ReadAllText(curFile));
            }
            var curFileDev = Path.Combine(dirPath, $"mongodb.test.config.json");
            if (File.Exists(curFileDev)) {
                if (config == null)
                    config = JsonConvert.DeserializeObject<DocumentDbConfiguration>(File.ReadAllText(curFileDev));
                else
                    JsonConvert.PopulateObject(File.ReadAllText(curFileDev), config);
            }
            return config;
        }
    }
    #endregion

    public class DocumentFixture : IDisposable, IAppSupport, IConnectionRetriever, IDataResourceService {
        readonly IDocumentUnitOfWork _duow = null;
        readonly IDefinitionDataService _definitionDataService = null;
        readonly IDefinitionSupportService _definitionSupportService;
        readonly IIntegrityCheckService _integrityCheckService = null;
        readonly IFlowItemImagePersister _jsonImagePersister = null;
        readonly DocumentDbConfiguration _config = null;
        readonly ILoggerFactory _loggerFac;
        readonly IEngineFactory _engineFactory = null;
        readonly IExpressionEvaluator _expressionEvaluator = null;
        readonly IFlowElementFactory _flowElementFactory = null;
        readonly Dictionary<string, IDecoratorEngine> _decEngines = null;
        readonly Dictionary<string, IKeysIteratorEngine> _keysEngines = null;
        readonly Dictionary<string, IWriterEngine> _writerEngines = null;
        readonly Dictionary<string, IValidatorEngine> _validatorEngines = null;
        readonly Dictionary<string, IAggregatorEngine> _aggregatorEngines = null;
        readonly IFlowConfigurationReader _flowConfigReader = null;
        readonly IFlowConfigurationBuilder _flowConfigBuilder = null;
        readonly IFlowRunner _flowRunner = null;
        readonly IFlowRunner _dumpFlowRunner = null;
        readonly ILogger<FlowRunner> _flowRunnerLogger;
        readonly ILogger<DumpFlowRunner> _dumpFlowRunnerLogger;
        static ILoggerFactory ConfigureLoggerFactory() => LoggerFactory.Create(logging => logging.AddConsole());

        public DocumentFixture() {
            // setup configuration
            _config = DocumentDbConfiguration.Load();

            // configure logger
            _loggerFac = ConfigureLoggerFactory();
            _flowRunnerLogger = _loggerFac.CreateLogger<FlowRunner>();
            _dumpFlowRunnerLogger = _loggerFac.CreateLogger<DumpFlowRunner>();

            // expression evaluator
            _expressionEvaluator = new FleeExpressionEvaluator();

            // decorator engines
            _decEngines = new Dictionary<string, IDecoratorEngine>
            {
                { Constants.DECORATOR_CONSTANT, new ConstantDecoratorEngine() },
                { Constants.DECORATOR_KEY, new KeyDecoratorEngine() },
                { Constants.DECORATOR_EXPRESSION, new ExpressionDecoratorEngine(_expressionEvaluator) },
                { "MSSQL", null /* fake registration for testing */},
            };

            // keys iterator engines
            _keysEngines = new Dictionary<string, IKeysIteratorEngine>
            {
                { KeysIteratorSourceType.RANGE, new RangeKeysIteratorEngine() },
                { "MSSQL", null /* fake registration for testing */},
                { "WEBAPI", null /* fake registration for testing */}
            };

            // validator engines
            _validatorEngines = new Dictionary<string, IValidatorEngine>
            {
                { ValidatorEngineKind.DEFAULT, new DefaultValidatorEngine(_expressionEvaluator) }
            };

            // aggregator engines
            _aggregatorEngines = new Dictionary<string, IAggregatorEngine>
            {
                { AggregatorEngineKind.DEFAULT, new DefaultAggregatorEngine(_expressionEvaluator) }
            };

            // writer engines
            _writerEngines = new Dictionary<string, IWriterEngine>
            {
                { WriterEngineKind.CONSOLE, new ConsoleWriterEngine() }
            };

            // engine factory
            _engineFactory = new EngineFactory(GetKeysIteratorEngine,
                                               GetDecoratorEngine,
                                               GetValidatorEngine,
                                               GetAggregatorEngine,
                                               GetWriterEngine,
                                               _expressionEvaluator,
                                               this);

            // flow element factory
            _flowElementFactory = new FlowElementFactory(_engineFactory, new ImageFactory(_expressionEvaluator));

            // image persisters
            _jsonImagePersister = new JsonFileImagePersister("test-assets/image_dat.json");

            // flow runners
            _flowRunner = new FlowRunner(_jsonImagePersister, _integrityCheckService, _flowRunnerLogger);
            _dumpFlowRunner = new DumpFlowRunner(_dumpFlowRunnerLogger);

            // register mappings
            new FARODbMappings().Register();

            // build Unit Of Work
            var opts = new FARODbOptionsBuilder(this).Buildptions();
            var mongoFactory = new MongoDbFactory<MongoDbOptions>(opts);
            var qsf = new BaseQuerySpecFactory(new IQuerySpec[] {
                new ImageDefinitionQuerySpec(),
                new FlowDefinitionQuerySpec()});
            _duow = new MongoDbUnitOfWork(mongoFactory, qsf);

            // Definition service
            _definitionDataService = new MongoDefinitionDataService(_duow);

            // integrity check service
            _integrityCheckService = new IntegrityCheckService(_engineFactory, _definitionDataService, _expressionEvaluator);

            // definition support service
            _definitionSupportService = new DefinitionSupportService(_engineFactory, _definitionDataService, _integrityCheckService);

            // config reader & builder
            _flowConfigReader = new JsonFlowConfigurationReader(_flowElementFactory);
            _flowConfigBuilder = new FlowConfigurationBuilder(_definitionDataService, _flowElementFactory);
        }

        #region IDisposable
        private bool _disposedValue = false; // To detect redundant calls

        protected virtual void Dispose(bool disposing) {
            if (!_disposedValue) {
                if (disposing) {
                    _duow.Dispose();
                    (_expressionEvaluator as IDisposable)?.Dispose();
                    (_definitionDataService as IDisposable)?.Dispose();
                    (_definitionSupportService as IDisposable)?.Dispose();
                    (_flowConfigReader as IDisposable)?.Dispose();
                    (_flowConfigBuilder as IDisposable)?.Dispose();
                    (_jsonImagePersister as IDisposable)?.Dispose();
                    (_dumpFlowRunnerLogger as IDisposable)?.Dispose();
                    (_flowRunnerLogger as IDisposable)?.Dispose();
                    (_dumpFlowRunner as IDisposable)?.Dispose();
                    (_flowRunner as IDisposable)?.Dispose();

                    (_integrityCheckService as IDisposable)?.Dispose();

                    foreach (var engine in _decEngines.Values) (engine as IDisposable)?.Dispose();
                    foreach (var engine in _keysEngines.Values) (engine as IDisposable)?.Dispose();
                    foreach (var engine in _validatorEngines.Values) (engine as IDisposable)?.Dispose();
                    foreach (var engine in _aggregatorEngines.Values) (engine as IDisposable)?.Dispose();
                    foreach (var engine in _writerEngines.Values) (engine as IDisposable)?.Dispose();

                    (_flowElementFactory as IDisposable)?.Dispose();
                    (_engineFactory as IDisposable)?.Dispose();
                    _loggerFac.Dispose();
                }
                _disposedValue = true;
            }
        }

        public void Dispose() {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        #endregion

        #region Connection Retriever interface impl
        string IConnectionRetriever.GetConnectionString(string connectionName) => null;
        string IConnectionRetriever.GetServer(string connectionName) => connectionName switch
        {
            var s when s.StartsWith("MUSICBRAINZ@") => "https://musicbrainz.org/ws/2",
            _ => null,
        };

        IWebProxy IConnectionRetriever.GetProxyConnection(string connectionName) => connectionName switch
        {
            var s when s.StartsWith("proxy@") => new WebProxy("127.0.0.1:8080", false),
            _ => null,
        };
        #endregion

        #region App Support interface impl
        (string Server, string Database, string User, string Password)? IAppSupport.FARODB {
            get {
                var conn = _config.GetCurrentConnection();
                return ($"mongodb://{conn.Host}:{conn.Port}", conn.Database, conn.User, conn.Pwd);
            }
        }
        (string Server, string Database, string User, string Password)? IAppSupport.CACHEDB => null;
        (string Server, string Database, string User, string Password)? IAppSupport.IMAGEPERSISTERDB => null;
        string IAppSupport.KeysIteratorsDataRootPath => null;
        string IAppSupport.DecoratorsDataRootPath => null;
        string IAppSupport.ValidatorsDataRootPath => null;
        string IAppSupport.AggregatorsDataRootPath => null;
        string IAppSupport.WritersDataRootPath => null;
        string IAppSupport.JsonFileDefinitionDataRootPath => null;
        IAppArguments IAppSupport.Arguments => null;
        #endregion

        #region Data Resource interface impl
        public bool ExistResource(string resourceName) => false;
        public string GetResourcePath(string resourceName) => null;
        #endregion

        public IAppSupport AppSupport => this;
        public IDocumentUnitOfWork DocumentUnitOfWork => _duow;
        public IDefinitionDataService DataService => _definitionDataService;
        public IDefinitionSupportService DefinitionSupportService => _definitionSupportService;
        public IIntegrityCheckService IntegrityCheckService => _integrityCheckService;
        public IEngineFactory EngineFactory => _engineFactory;
        public IExpressionEvaluator ExpressionEvaluator => _expressionEvaluator;
        public IFlowConfigurationReader FlowConfigurationReader => _flowConfigReader;
        public IFlowConfigurationBuilder FlowConfigurationBuilder => _flowConfigBuilder;
        public IFlowRunner FlowRunner => _flowRunner;
        public IFlowRunner DumpFlowRunner => _dumpFlowRunner;


        IKeysIteratorEngine GetKeysIteratorEngine(string sourceType) => _keysEngines[sourceType];
        IDecoratorEngine GetDecoratorEngine(string sourceType) => _decEngines[sourceType];
        IValidatorEngine GetValidatorEngine(string kind) => _validatorEngines[kind];
        IAggregatorEngine GetAggregatorEngine(string kind) => _aggregatorEngines[kind];
        IWriterEngine GetWriterEngine(string kind) => _writerEngines[kind];

    }


    [CollectionDefinition("Document collection")]
    public class DocumentCollection : ICollectionFixture<DocumentFixture> {

        // This class has no code, and is never created. Its purpose is simply
        // to be the place to apply [CollectionDefinition] and all the
        // ICollectionFixture<> interfaces.
    }
}
