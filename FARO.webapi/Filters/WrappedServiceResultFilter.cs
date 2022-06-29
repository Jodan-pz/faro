using System.Linq;
using System.Net.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Filters;

namespace FARO.WebApi.Filters {
    class WrappedServiceResultFilter : IResultFilter {
        public void OnResultExecuted(ResultExecutedContext context) { }

        public void OnResultExecuting(ResultExecutingContext context) {
            if (!context.Cancel) {
                if (context.ActionDescriptor is ControllerActionDescriptor cad) {
                    var ignoreController = cad.ControllerTypeInfo.GetCustomAttributes(typeof(WrappedServiceResultIgnoreAttribute), false).Any();
                    if (ignoreController) return;
                    var ignoreAction = cad.ControllerTypeInfo.GetMethod(cad.ActionName)?.GetCustomAttributes(typeof(WrappedServiceResultIgnoreAttribute), false).Any();
                    if (ignoreAction ?? false) return;
                }

                if (context.Result is ObjectResult controllerResult) {
                    if (controllerResult.Value is HttpResponseMessage) {
                        return;
                    } else if (controllerResult.Value is IWrappedServiceResult) {
                        context.Result = new OkObjectResult(controllerResult.Value);
                    } else {
                        // create result
                        context.Result = new OkObjectResult(new WrappedServiceResult<object>(controllerResult.Value));
                    }
                }
            }
        }
    }
}