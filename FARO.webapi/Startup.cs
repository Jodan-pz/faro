using System;
using System.IO;
using System.Reflection;

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;

using FARO.Extensions.DependencyInjection;
using FARO.WebApi.Extensions.DependecyInjection;

using Lamar;

using Newtonsoft.Json.Serialization;

using Swashbuckle.AspNetCore.SwaggerUI;

using Unchase.Swashbuckle.AspNetCore.Extensions.Extensions;


namespace FARO.WebApi {

    public class Startup {
        public Startup(IConfiguration configuration, IWebHostEnvironment hostingEnvironment) {
            Configuration = configuration;
            HostingEnvironment = hostingEnvironment;
        }

        IConfiguration Configuration { get; }
        IWebHostEnvironment HostingEnvironment { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureContainer(ServiceRegistry services) {
            services.AddFAROSupport(Configuration, HostingEnvironment, true);
            services.AddFARO(Configuration);
            services.AddControllers(m => m.AddFAROFilters())
                    .AddNewtonsoftJson(j => j.SerializerSettings.ContractResolver = new DefaultContractResolver());

            if (HostingEnvironment.IsDevelopment()) {
                // Add Swagger integration            
                services.AddSwaggerGen(options => {
                    options.AddEnumsWithValuesFixFilters(); // fix swashbuckle openapi x-enumNames
                    options.SwaggerDoc("v1", new OpenApiInfo
                    {
                        Title = "FARO",
                        Version = "v1",
                        Description = "FARO Web Api"
                    });
                    options.CustomOperationIds(ad => $"{ad.ActionDescriptor.RouteValues["controller"]}_{ad.ActionDescriptor.RouteValues["action"]}");
                    // Set the comments path for the Swagger JSON and UI.
                    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
                    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
                    if (File.Exists(xmlPath)) options.IncludeXmlComments(xmlPath);
                }).AddSwaggerGenNewtonsoftSupport();
            }
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env) {
            if (env.IsDevelopment()) {
                app.UseSwagger();
                app.UseSwaggerUI(c => {
                    c.DocExpansion(DocExpansion.None);
                    c.SwaggerEndpoint("v1/swagger.json", "FARO API v1");
                });
            } else {
                app.UseStaticFiles();
                app.UseSpaStaticFiles();
            }

            app.UseRouting();
            app.MapWhen(spaWhen => {
                var isDave = spaWhen.Request.Path.Value.Contains("/dave/", StringComparison.InvariantCultureIgnoreCase);
                var isServerApi = spaWhen.Request.Path.Value.Contains("/api/", StringComparison.InvariantCultureIgnoreCase);
                return !isDave && !isServerApi;
            }, builder => {
                if (env.IsDevelopment()) {
                    builder.UseSpa(spa => {
                        spa.UseProxyToSpaDevelopmentServer(Configuration["DevClientUri"]);
                    });
                } else {
                    builder.UseSpa(spa => spa.Options.SourcePath = Configuration["ClientAppPath"]);
                }
            });
            app.UseFAROSupport(Configuration, env);
            app.UseEndpoints(e => e.MapControllers());
        }
    }
}
