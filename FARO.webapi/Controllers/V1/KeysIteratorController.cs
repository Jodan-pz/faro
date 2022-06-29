using System;
using System.Collections.Generic;
using System.Linq;
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
    public class KeysIteratorController : ControllerBase {
        readonly IEngineFactory _engineFactory;
        readonly IDefinitionDataService _definitionDataService;
        readonly IDefinitionSupportService _definitionSupportService;

        public KeysIteratorController(IEngineFactory engineFactory,
                                      IDefinitionDataService definitionDataService,
                                      IDefinitionSupportService definitionSupportService) {
            _engineFactory = engineFactory ?? throw new ArgumentNullException(nameof(engineFactory));
            _definitionDataService = definitionDataService ?? throw new ArgumentNullException(nameof(definitionDataService));
            _definitionSupportService = definitionSupportService ?? throw new ArgumentNullException(nameof(definitionSupportService));
        }

        [HttpGet("{id}/usage")]
        [ProducesResponseType(typeof(WrappedServiceResult<KeysIteratorUsageCollection>), (int)HttpStatusCode.OK)]
        public KeysIteratorUsageCollection GetKeysIteratorUsage(string id) => _definitionSupportService.GetKeysIteratorUsage(id);

        [HttpPost("run/{id}")]
        [ProducesResponseType(typeof(WrappedServiceResult<IEnumerable<IDictionary<string, object>>>), (int)HttpStatusCode.OK)]
        public IEnumerable<IDictionary<string, object>> Run(string id, [FromBody] KeysIteratorRunDefinition runDefinition) {
            var definition = _definitionDataService.GetKeysIterator(id) ?? throw new NullReferenceException($"Cannot find keys iterator with id: {id}");
            var dicKey = runDefinition.Arguments?.ToDictionary(k => k.Name, v => v.Value) ?? new Dictionary<string, object>();
            var keysIterator = _engineFactory.CreateKeysIterator(KeysIteratorScopedDefinition.Create(definition));
            var ret = new List<IDictionary<string, object>>();
            keysIterator.Iterate(dicKey, k => {
                ret.Add(k);
                return (runDefinition.KeysLimit ?? 0) <= 0 || ret.Count < runDefinition.KeysLimit;
            });
            return ret;
        }

        [HttpGet("search")]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        [ProducesResponseType(typeof(WrappedServiceResult<IEnumerable<KeysIteratorDefinition>>), (int)HttpStatusCode.OK)]
        public IEnumerable<KeysIteratorDefinition> List(string filter = null,
                                                        FilterMatchMode filterMatchMode = FilterMatchMode.Contains,
                                                        [FromQuery] string[] tags = null,
                                                        TagsMatchMode tagsMatchMode = TagsMatchMode.Any,
                                                        int? pageIndex = null, int? pageSize = null) => _definitionDataService.ListKeysIterators(filter, filterMatchMode, tags, tagsMatchMode, pageIndex, pageSize);

        [HttpGet("{id}")]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        [ProducesResponseType(typeof(WrappedServiceResult<KeysIteratorDefinition>), (int)HttpStatusCode.OK)]
        public KeysIteratorDefinition GetById(string id) => _definitionDataService.GetKeysIterator(id);

        [HttpPost]
        [ProducesResponseType(typeof(WrappedServiceResult<KeysIteratorDefinition>), (int)HttpStatusCode.OK)]
        public KeysIteratorDefinition Create([FromBody] KeysIteratorDefinition keysIterator) => _definitionDataService.CreateKeysIterator(keysIterator);

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(WrappedServiceResult<KeysIteratorDefinition>), (int)HttpStatusCode.OK)]
        public KeysIteratorDefinition Update(string id, [FromBody] KeysIteratorDefinition keysIterator) => _definitionDataService.UpdateKeysIterator(id, keysIterator);

        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(WrappedServiceResult<bool>), (int)HttpStatusCode.OK)]
        public bool Delete(string id) => _definitionDataService.DeleteKeysIterator(id);
    }
}
