using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
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
    public class DecoratorController : ControllerBase {
        readonly IEngineFactory _engineFactory;
        readonly IDefinitionDataService _definitionDataService;
        readonly IDefinitionSupportService _definitionSupportService;

        public DecoratorController(IEngineFactory engineFactory,
                                   IDefinitionDataService definitionDataService,
                                   IDefinitionSupportService definitionSupportService) {
            _engineFactory = engineFactory ?? throw new ArgumentNullException(nameof(engineFactory));
            _definitionDataService = definitionDataService ?? throw new ArgumentNullException(nameof(definitionDataService));
            _definitionSupportService = definitionSupportService ?? throw new ArgumentNullException(nameof(definitionSupportService));
        }

        [HttpGet("{id}/usage")]
        [ProducesResponseType(typeof(WrappedServiceResult<DecoratorUsageCollection>), (int)HttpStatusCode.OK)]
        public DecoratorUsageCollection GetDecoratorUsage(string id) => _definitionSupportService.GetDecoratorUsage(id);

        [HttpPost("{id}/run")]
        [ProducesResponseType(typeof(WrappedServiceResult<IDictionary<string, object>>), (int)HttpStatusCode.OK)]
        public Task<IDictionary<string, object>> Run(string id, [FromBody] Dictionary<string, object> decArgs) {
            var definition = _definitionDataService.GetDecorator(id) ?? throw new NullReferenceException($"Cannot find decorator with id: {id}");
            var decorator = _engineFactory.CreateDecorator(definition, decArgs);
            var output = new ImageOutput();
            var keyRow = output.AddKey(decArgs);
            return decorator?.GetValuesAsync(keyRow);
        }

        [HttpGet("search")]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        [ProducesResponseType(typeof(WrappedServiceResult<IEnumerable<DecoratorDefinition>>), (int)HttpStatusCode.OK)]
        public IEnumerable<DecoratorDefinition> List(string filter = null,
                                                     FilterMatchMode filterMatchMode = FilterMatchMode.Contains,
                                                     [FromQuery] string[] tags = null,
                                                     TagsMatchMode tagsMatchMode = TagsMatchMode.Any,
                                                     int? pageIndex = null, int? pageSize = null) => _definitionDataService.ListDecorators(filter, filterMatchMode, tags, tagsMatchMode, pageIndex, pageSize);

        [HttpGet("{id}")]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        [ProducesResponseType(typeof(WrappedServiceResult<DecoratorDefinition>), (int)HttpStatusCode.OK)]
        public DecoratorDefinition GetById(string id) => _definitionDataService.GetDecorator(id);

        [HttpPost]
        [ProducesResponseType(typeof(WrappedServiceResult<DecoratorDefinition>), (int)HttpStatusCode.OK)]
        public DecoratorDefinition Create([FromBody] DecoratorDefinition decorator) => _definitionDataService.CreateDecorator(decorator);

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(WrappedServiceResult<DecoratorDefinition>), (int)HttpStatusCode.OK)]
        public DecoratorDefinition Update(string id, [FromBody] DecoratorDefinition decorator) => _definitionDataService.UpdateDecorator(id, decorator);

        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(WrappedServiceResult<bool>), (int)HttpStatusCode.OK)]
        public bool Delete(string id) => _definitionDataService.DeleteDecorator(id);
    }
}
