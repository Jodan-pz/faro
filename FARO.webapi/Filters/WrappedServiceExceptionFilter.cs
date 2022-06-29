using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Filters;

namespace FARO.WebApi.Filters {
    class WrappedServiceExceptionFilter : IExceptionFilter {
        public void OnException(ExceptionContext context) {
            if (context.ActionDescriptor is ControllerActionDescriptor cad) {
                var ignoreController = cad.ControllerTypeInfo.GetCustomAttributes(typeof(WrappedServiceResultIgnoreAttribute), false).Any();
                if (ignoreController) return;
                var ignoreAction = cad.ControllerTypeInfo.GetMethod(cad.ActionName)?.GetCustomAttributes(typeof(WrappedServiceResultIgnoreAttribute), false).Any();
                if (ignoreAction ?? false) return;
            }
            var ret = new WrappedServiceResult<object>();
            ret.AddError(context.Exception);
            context.Result = new OkObjectResult(ret);
            context.ExceptionHandled = true;
        }
    }
}