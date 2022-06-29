using System;
using System.Collections.Generic;
using System.Net;
using FARO.Common;
using FARO.Common.Domain;
using Microsoft.AspNetCore.Mvc;
using FARO.WebApi.Filters;

namespace FARO.WebApi.Controllers.V1 {
    [Route("api/v1/[controller]")]
    [ApiController]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
    public class SourceDefinitionController : ControllerBase {
        readonly Func<string, IDecoratorSource> _decSources;
        readonly Func<string, IKeysIteratorSource> _keysIterSources;

        public SourceDefinitionController(Func<string, IDecoratorSource> decSources, Func<string, IKeysIteratorSource> keysIterSources) {
            _decSources = decSources ?? throw new ArgumentNullException(nameof(decSources));
            _keysIterSources = keysIterSources ?? throw new ArgumentNullException(nameof(keysIterSources));
        }

        [HttpGet("decorator/args")]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        [ProducesResponseType(typeof(WrappedServiceResult<IEnumerable<Argument>>), (int)HttpStatusCode.OK)]
        public IEnumerable<Argument> GetDecoratorSourceArguments(string sourceType) => ModelState.IsValid ? _decSources(sourceType)?.Arguments : null;

        [HttpGet("keysiterator/args")]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        [ProducesResponseType(typeof(WrappedServiceResult<IEnumerable<Argument>>), (int)HttpStatusCode.OK)]
        public IEnumerable<Argument> GetKeysIteratorSourceArguments(string sourceType) => ModelState.IsValid ? _keysIterSources(sourceType)?.Arguments : null;
    }
}
