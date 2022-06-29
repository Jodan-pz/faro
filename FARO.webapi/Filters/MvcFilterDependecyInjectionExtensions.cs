using FARO.WebApi.Filters;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace FARO.Extensions.DependencyInjection {

    public static class MvcFilterDependecyInjectionExtensions {
        public static FilterCollection AddFAROServiceFilters(this FilterCollection filters) {
            // add Yoda Service result/error filters
            filters.Add(typeof(WrappedServiceResultFilter));
            filters.Add(typeof(WrappedServiceExceptionFilter));
            return filters;
        }

        public static MvcOptions AddFAROFilters(this MvcOptions mvcOptions) {
            // filters
            mvcOptions.Filters.AddFAROServiceFilters();
            return mvcOptions;
        }
    }
}