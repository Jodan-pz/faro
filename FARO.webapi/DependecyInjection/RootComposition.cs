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

namespace FARO.WebApi.Extensions.DependecyInjection {
    public static class RootComposition {
        public static IServiceCollection AddFARO(this ServiceRegistry registry, IConfiguration configuration) {
            var config = Config.FromConfiguration(configuration);
            PathAssemblyResolver.AddToCurrentDomain();
            var cacheEngineConfigured = config.CacheEngine != null;

            AddExpressionEvaluator(registry, config.Expression);
            AddDefinitionData(registry, config.DefinitionData);
            AddSources(registry);
            AddKeysIterators(registry);
            AddDecorators(registry, config.CacheEngine);
            AddValidators(registry);
            AddAggregators(registry);
            AddWriters(registry);
            AddAddons(registry, config.Addons, cacheEngineConfigured);
            AddImagePersister(registry, config.ImagePersister);

            if (cacheEngineConfigured) registry.AddSingleton(config.CacheEngine);
            registry.AddScoped<IEngineFactory, EngineFactory>();
            registry.AddScoped<IImageFactory, ImageFactory>();
            registry.AddScoped<IFlowElementFactory, FlowElementFactory>();
            registry.AddScoped<IDefinitionSupportService, DefinitionSupportService>();
            registry.AddScoped<IIntegrityCheckService, IntegrityCheckService>();
            registry.AddScoped<IImageWatcher, ImageWatcher>();
            registry.AddScoped<IFlowConfigurationBuilder, FlowConfigurationBuilder>();
            registry.AddScoped<IFlowRunner, FlowRunner>();

            return registry;
        }

        private static void AddExpressionEvaluator(ServiceRegistry registry, ExpressionEvaluatorConfig expressionEvaluator) {
            switch (expressionEvaluator.Kind) {
                case ExpressionEvaluatorConfigKind.External:
                    var clazz = InternalGetTypeFromConfig(expressionEvaluator.Assembly, expressionEvaluator.Class);
                    if (clazz is null) return;
                    registry.Add(ServiceDescriptor.Describe(
                        typeof(IExpressionEvaluator),
                        clazz,
                        expressionEvaluator.WebApiScoped ? ServiceLifetime.Scoped : ServiceLifetime.Singleton
                        ));
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
                        registerMethod.Invoke(clazz, new object[] { registry, definitionData.Config, definitionData.WebApiScoped });
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

        private static void AddSources(ServiceRegistry registry) {
            registry.AddSingleton<RangeSource>();
            registry.ForSingletonOf<IKeysIteratorSource>()
                    .Use(sp => sp.GetRequiredService<RangeSource>())
                    .Named(KeysIteratorSourceType.RANGE);
        }

        private static void AddKeysIterators(ServiceRegistry registry) {
            registry.For<IKeysIteratorEngine>()
                    .Use<RangeKeysIteratorEngine>()
                    .Singleton()
                    .Named(KeysIteratorSourceType.RANGE);
        }

        private static void AddDecorators(ServiceRegistry registry, CacheEngineConfig cacheEngineConfig) {
            registry.ForSingletonOf<IDecoratorEngine>()
                    .Use<KeyDecoratorEngine>()
                    .Named(DECORATOR_KEY);

            registry.ForSingletonOf<IDecoratorEngine>()
                    .Use<ConstantDecoratorEngine>()
                    .Named(DECORATOR_CONSTANT);

            registry.ForSingletonOf<IDecoratorEngine>()
                    .Use<ExpressionDecoratorEngine>()
                    .Named(DECORATOR_EXPRESSION);

            if (cacheEngineConfig != null) {
                if (cacheEngineConfig.Is<MemoryCacheEngineConfig>(out var memCache)) {
                    registry.AddDistributedMemoryCache(options => {
                        if (memCache.ExpirationScan != null) options.ExpirationScanFrequency = TimeSpan.FromSeconds(memCache.ExpirationScan.Value);
                        if (memCache.SizeLimit != null) options.SizeLimit = memCache.SizeLimit;
                    });
                } else if (cacheEngineConfig.Is<RedisCacheEngineConfig>(out var redisCache)) {
                    registry.AddScoped<IOptions<RedisCacheOptions>>(sp => {
                        var support = sp.GetService<IAppSupport>();
                        var redisCacheDb = support?.CACHEDB;
                        return Options.Create(new RedisCacheOptions { Configuration = redisCacheDb?.Server, InstanceName = redisCacheDb?.Database });
                    });
                    registry.AddScoped<IDistributedCache, RedisCache>();
                }
                registry.AddScoped<IDecoratorEngineCache, DecoratorEngineCache>();
            }
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

        private static void AddAddons(ServiceRegistry registry, AddonsConfig addons, bool cacheEngineConfigured) {
            registry.ScanAddons(addons, addon => {
                addon.Decorator = dec => {
                    var asm = AssemblyLoadContext.Default.LoadFromAssemblyPath(Path.GetFullPath(dec.Assembly));
                    var engType = asm.GetType(dec.Engine);
                    var sourceType = asm.GetType(dec.Source);
                    // source
                    if (!registry.Exists(sd => sd.ServiceType == sourceType)) {
                        registry.AddSingleton(sourceType);
                    }
                    registry.ForSingletonOf<IDecoratorSource>()
                            .Use(sp => sp.GetRequiredService(sourceType) as IDecoratorSource)
                            .Named(dec.Id);

                    if (cacheEngineConfigured) {
                        registry.AddScoped(engType);
                        registry.For<IDecoratorEngine>()
                                .Use<CachedDecoratorEngine>()
                                .Ctor<IDecoratorEngine>().Is(sc => sc.GetRequiredService(engType) as IDecoratorEngine)
                                .Scoped()
                                .Named(dec.Id);
                    } else {
                        if (dec.WebApiScoped) {
                            registry.For(typeof(IDecoratorEngine))
                                    .Use(engType)
                                    .Scoped()
                                    .Named(dec.Id);
                        } else {
                            registry.For(typeof(IDecoratorEngine))
                                    .Use(engType)
                                    .Singleton()
                                    .Named(dec.Id);
                        }
                    }
                };
                addon.KeyIterator = kei => {
                    var asm = AssemblyLoadContext.Default.LoadFromAssemblyPath(Path.GetFullPath(kei.Assembly));
                    var engType = asm.GetType(kei.Engine);
                    var sourceType = asm.GetType(kei.Source);
                    // source
                    if (!registry.Exists(sd => sd.ServiceType == sourceType)) {
                        registry.AddSingleton(sourceType);
                    }
                    registry.ForSingletonOf<IKeysIteratorSource>()
                            .Use(sp => sp.GetRequiredService(sourceType) as IKeysIteratorSource)
                            .Named(kei.Id);
                    if (kei.WebApiScoped) {
                        registry.For(typeof(IKeysIteratorEngine))
                                .Use(engType)
                                .Scoped()
                                .Named(kei.Id);
                    } else {
                        registry.For(typeof(IKeysIteratorEngine))
                                .Use(engType)
                                .Singleton()
                                .Named(kei.Id);
                    }
                };
                addon.Aggregator = agg => {
                    var engType = InternalGetTypeFromConfig(agg.Assembly, agg.Engine);
                    if (agg.WebApiScoped) {
                        registry.For(typeof(IAggregatorEngine))
                                .Use(engType)
                                .Scoped()
                                .Named(agg.Id);
                    } else {
                        registry.For(typeof(IAggregatorEngine))
                                .Use(engType)
                                .Singleton()
                                .Named(agg.Id);
                    }
                };
                addon.Validator = val => {
                    var engType = InternalGetTypeFromConfig(val.Assembly, val.Engine);
                    if (val.WebApiScoped) {
                        registry.For(typeof(IValidatorEngine))
                                .Use(engType)
                                .Scoped()
                                .Named(val.Id);
                    } else {
                        registry.For(typeof(IValidatorEngine))
                                .Use(engType)
                                .Singleton()
                                .Named(val.Id);
                    }
                };
                addon.Writer = wri => {
                    var engType = InternalGetTypeFromConfig(wri.Assembly, wri.Engine);
                    if (wri.WebApiScoped) {
                        registry.For(typeof(IWriterEngine))
                                .Use(engType)
                                .Scoped()
                                .Named(wri.Id);
                    } else {
                        registry.For(typeof(IWriterEngine))
                                .Use(engType)
                                .Singleton()
                                .Named(wri.Id);
                    }
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
                registerMethod.Invoke(clazz, new object[] { registry, imagePersisterConfig.Config, imagePersisterConfig.WebApiScoped });
            } else {
                if (imagePersisterConfig.WebApiScoped) {
                    registry.For(typeof(IFlowItemImagePersister))
                            .Use(clazz)
                            .Scoped();
                } else {
                    registry.For(typeof(IFlowItemImagePersister))
                            .Use(clazz)
                            .Singleton();
                }
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
