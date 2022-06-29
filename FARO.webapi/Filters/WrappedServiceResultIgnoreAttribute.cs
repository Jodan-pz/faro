
using System;

namespace FARO.WebApi.Filters {
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, Inherited = false)]
    public class WrappedServiceResultIgnoreAttribute : Attribute {
    }
}