using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;

using Microsoft.AspNetCore.Mvc;

using FARO.Common;

using Lamar;

using FARO.WebApi.Filters;

namespace FARO.WebApi.Controllers.V1 {
    [Route("api/v1/[controller]")]
    [ApiController]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
    public class EngineRegistrationController : ControllerBase {
        private readonly IContainer _container;

        public EngineRegistrationController(IContainer container) {
            _container = container ?? throw new ArgumentNullException(nameof(container));
        }

        [HttpGet]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        [ProducesResponseType(typeof(WrappedServiceResult<Dictionary<string, IEnumerable<string>>>), (int)HttpStatusCode.OK)]
        public Dictionary<string, IEnumerable<string>> GetRegistered() {
            var ret = new Dictionary<string, IEnumerable<string>>();

            var keys = _container.Model.InstancesOf<IKeysIteratorEngine>()
                                       .Select(s => s.Name)
                                       .OrderBy(s => s);

            var decs = _container.Model.InstancesOf<IDecoratorEngine>()
                                             .Select(s => s.Name)
                                             .Where(s => s != Constants.DECORATOR_KEY &&
                                                         s != Constants.DECORATOR_CONSTANT &&
                                                         s != Constants.DECORATOR_EXPRESSION)
                                                         .OrderBy(s => s);

            var aggrs = _container.Model.InstancesOf<IAggregatorEngine>()
                                       .Select(s => s.Name)
                                       .OrderBy(s => s);

            var vals = _container.Model.InstancesOf<IValidatorEngine>()
                                       .Select(s => s.Name)
                                       .OrderBy(s => s);

            var wris = _container.Model.InstancesOf<IWriterEngine>()
                                       .Select(s => s.Name)
                                       .OrderBy(s => s);

            ret.Add("KeysIterators", keys);
            ret.Add("Decorators", decs);
            ret.Add("Aggregators", aggrs);
            ret.Add("Validators", vals);
            ret.Add("Writers", wris);

            return ret;
        }
    }
}
