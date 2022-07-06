using System;
using System.IO;
using System.Reflection;
using System.Runtime.Loader;

using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Redis;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

using FARO.Common;
using FARO.Common.Domain;
using FARO.Expression;
using FARO.Extensions.DependencyInjection;
using FARO.Services;
using FARO.Services.Aggregators.Engine;
using FARO.Services.Decorators.Engine;
using FARO.Services.Decorators.Engine.Cache;
using FARO.Services.KeysIterators.Engine;
using FARO.Services.Runners;
using FARO.Services.Validators.Engine;
using FARO.Services.Writers.Engine;

using Lamar;

using static FARO.Common.Constants;

namespace FARO.Batch.Extensions.DependecyInjection {

    public static class RootComposition {

        public static IServiceCollection AddFARO(this ServiceRegistry registry, IConfiguration configuration) {
            var config = Config.FromConfiguration(configuration);
            PathAssemblyResolver.AddToCurrentDomain();
            // default if not configured
            var cacheEngine = config.CacheEngine ?? new MemoryCacheEngineConfig();

            AddExpressionEvaluator(registry, config.Expression);
            AddDefinitionData(registry, config.DefinitionData);
            AddFlowConfigurationBuilder(registry, config.FlowConfiguration);
            AddFlowRunner(registry, config.FlowRunner);
            AddKeysIterators(registry);
            AddDecorators(registry, cacheEngine);
            AddValidators(registry);
            AddAggregators(registry);
            AddWriters(registry);
            AddAddons(registry, config.Addons);
            AddImagePersister(registry, config.ImagePersister);

            registry.AddSingleton(cacheEngine);
            registry.AddSingleton<IEngineFactory, EngineFactory>();
            registry.AddSingleton<IImageFactory, ImageFactory>();
            registry.AddSingleton<IFlowElementFactory, FlowElementFactory>();
            registry.AddSingleton<IDefinitionSupportService, DefinitionSupportService>();
            registry.AddSingleton<IIntegrityCheckService, IntegrityCheckService>();
            registry.AddSingleton<IFAROBatch, FAROBatch>();

            return registry;
        }

        private static void AddExpressionEvaluator(ServiceRegistry registry, ExpressionEvaluatorConfig expressionEvaluator) {
            switch (expressionEvaluator.Kind) {
                case ExpressionEvaluatorConfigKind.External:
                    var clazz = InternalGetTypeFromConfig(expressionEvaluator.Assembly, expressionEvaluator.Class);
                    if (clazz is null) return;
                    registry.For(typeof(IExpressionEvaluator))
                            .Use(clazz)
                            .Singleton();
                    break;
                case ExpressionEvaluatorConfigKind.Default:
                default:
                    registry.AddSingleton<IExpressionEvaluator, FleeExpressionEvaluator>();
                    break;
            }
        }

        private static void AddDefinitionData(ServiceRegistry registry, DefinitionDataServiceConfig definitionData) {
            switch (definitionData.Kind) {
                case DefinitionDataServiceConfigKind.External:
                    var clazz = InternalGetTypeFromConfig(definitionData.Assembly, definitionData.Class);
                    if (clazz is null) return;
                    var registerMethod = definitionData.RegisterMethod is not null
                                         ? clazz.GetMethod(definitionData.RegisterMethod, BindingFlags.Public | BindingFlags.Static)
                                         : null;
                    if (registerMethod is not null) {
                        registerMethod.Invoke(clazz, new object[] { registry, definitionData.Config, false });
                    } else {
                        registry.For(typeof(IDefinitionDataService))
                                .Use(clazz)
                                .Singleton();
                    }
                    break;
                case DefinitionDataServiceConfigKind.None:
                    break;
                case DefinitionDataServiceConfigKind.Default:
                default:
                    registry.AddSingleton<IDefinitionDataService, JsonFileDefinitionDataService>();
                    break;
            }
        }

        private static void AddKeysIterators(ServiceRegistry registry) {
            registry.ForSingletonOf<IKeysIteratorEngine>()
                    .Use<RangeKeysIteratorEngine>()
                    .Named(KeysIteratorSourceType.RANGE);
        }

        private static void AddDecorators(ServiceRegistry registry, CacheEngineConfig cacheEngineConfig) {
            if (cacheEngineConfig.Is<MemoryCacheEngineConfig>(out var memCache)) {
                registry.AddDistributedMemoryCache(options => {
                    if (memCache.ExpirationScan != null) options.ExpirationScanFrequency = TimeSpan.FromSeconds(memCache.ExpirationScan.Value);
                    if (memCache.SizeLimit != null) options.SizeLimit = memCache.SizeLimit;
                });
            } else if (cacheEngineConfig.Is<RedisCacheEngineConfig>(out var redisCache)) {
                registry.AddSingleton<IOptions<RedisCacheOptions>>(sp => {
                    var support = sp.GetService<IAppSupport>();
                    var redisCacheDb = support?.CACHEDB;
                    return Options.Create(new RedisCacheOptions { Configuration = redisCacheDb?.Server, InstanceName = redisCacheDb?.Database });
                });
                registry.AddSingleton<IDistributedCache, RedisCache>();
            }

            registry.ForSingletonOf<IDecoratorEngineCache>()
                    .Use<DecoratorEngineCache>();

            registry.ForSingletonOf<IDecoratorEngine>()
                    .Use<KeyDecoratorEngine>()
                    .Named(DECORATOR_KEY);

            registry.ForSingletonOf<IDecoratorEngine>()
                    .Use<ConstantDecoratorEngine>()
                    .Named(DECORATOR_CONSTANT);

            registry.ForSingletonOf<IDecoratorEngine>()
                    .Use<ExpressionDecoratorEngine>()
                    .Named(DECORATOR_EXPRESSION);
        }

        private static void AddAggregators(ServiceRegistry registry) {
            registry.ForSingletonOf<IAggregatorEngine>()
                    .Use<DefaultAggregatorEngine>()
                    .Named(AggregatorEngineKind.DEFAULT);
        }

        private static void AddValidators(ServiceRegistry registry) {
            registry.ForSingletonOf<IValidatorEngine>()
                    .Use<DefaultValidatorEngine>()
                    .Named(ValidatorEngineKind.DEFAULT);
        }

        private static void AddWriters(ServiceRegistry registry) {
            registry.ForSingletonOf<IWriterEngine>()
                    .Use<ConsoleWriterEngine>()
                    .Named(WriterEngineKind.CONSOLE);
        }

        private static void AddAddons(ServiceRegistry registry, AddonsConfig addons) {
            registry.ScanAddons(addons, addon => {
                addon.Decorator = dec => {
                    var engType = InternalGetTypeFromConfig(dec.Assembly, dec.Engine);
                    registry.AddSingleton(engType);
                    registry.ForSingletonOf<IDecoratorEngine>()
                            .Use<CachedDecoratorEngine>()
                            .Ctor<IDecoratorEngine>().Is("Addon decorator " + dec.Id, sc => sc.GetRequiredService(engType) as IDecoratorEngine)
                            .Named(dec.Id);
                };
                addon.KeyIterator = kei => {
                    var engType = InternalGetTypeFromConfig(kei.Assembly, kei.Engine);
                    registry.For(typeof(IKeysIteratorEngine))
                            .Use(engType)
                            .Singleton()
                            .Named(kei.Id);
                };
                addon.Aggregator = agg => {
                    var engType = InternalGetTypeFromConfig(agg.Assembly, agg.Engine);
                    registry.For(typeof(IAggregatorEngine))
                            .Use(engType)
                            .Singleton()
                            .Named(agg.Id);
                };
                addon.Validator = val => {
                    var engType = InternalGetTypeFromConfig(val.Assembly, val.Engine);
                    registry.For(typeof(IValidatorEngine))
                            .Use(engType)
                            .Singleton()
                            .Named(val.Id);
                };
                addon.Writer = wri => {
                    var engType = InternalGetTypeFromConfig(wri.Assembly, wri.Engine);
                    registry.For(typeof(IWriterEngine))
                            .Use(engType)
                            .Singleton()
                            .Named(wri.Id);
                };
            });
        }

        private static void AddImagePersister(ServiceRegistry registry, ImagePersisterConfig imagePersisterConfig) {
            var clazz = InternalGetTypeFromConfig(imagePersisterConfig?.Assembly, imagePersisterConfig?.Class);
            if (clazz is null) return;
            var registerMethod = imagePersisterConfig.RegisterMethod is not null
                                 ? clazz.GetMethod(imagePersisterConfig.RegisterMethod, BindingFlags.Public | BindingFlags.Static)
                                 : null;
            if (registerMethod is not null) {
                registerMethod.Invoke(clazz, new object[] { registry, imagePersisterConfig.Config, false });
            } else {
                registry.For(typeof(IFlowItemImagePersister))
                        .Use(clazz)
                        .Singleton();
            }
        }

        private static void AddFlowRunner(ServiceRegistry registry, FlowRunnerConfig flowRunnerConfig) {
            var clazz = InternalGetTypeFromConfig(flowRunnerConfig?.Assembly, flowRunnerConfig?.Class) ?? typeof(FlowRunner);
            registry.For(typeof(IFlowRunner))
                    .Use(clazz)
                    .Singleton();
        }

        private static void AddFlowConfigurationBuilder(ServiceRegistry registry, FlowConfigurationBuilderConfig flowConfigurationBuilderConfig) {
            switch (flowConfigurationBuilderConfig.Kind) {
                case FlowConfigurationBuilderKind.Json:
                    var configFile = new FileInfo(flowConfigurationBuilderConfig.File);
                    registry.AddSingleton<IFlowConfigurationReader, JsonFlowConfigurationReader>();
                    registry.For<IFlowConfigurationBuilder>()
                            .Use<FlowConfigurationReaderAdapter>()
                            .Ctor<FileInfo>("configurationFile").Is(configFile)
                            .Singleton();
                    registry.For<IDefinitionDataService>()
                            .Use(sc =>
                                (IDefinitionDataService)sc.GetRequiredService<IFlowConfigurationBuilder>()
                            );
                    break;
                default:
                    registry.AddSingleton<IFlowConfigurationBuilder, FlowConfigurationBuilder>();
                    break;
            }
        }

        private static Type InternalGetTypeFromConfig(string assemblyName, string className) {
            if (assemblyName is null) return null;
            var asm = AssemblyLoadContext.Default.LoadFromAssemblyPath(Path.GetFullPath(assemblyName));
            var clazz = asm.GetType(className);
            return clazz;
        }
    }
}
