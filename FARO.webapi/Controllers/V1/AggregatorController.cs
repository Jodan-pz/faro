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
    public class AggregatorController : ControllerBase {
        readonly IDefinitionDataService _dataService;
        private readonly IDefinitionSupportService _definitionSupportService;

        public AggregatorController(IDefinitionDataService dataService, IDefinitionSupportService definitionSupportService) {
            _dataService = dataService ?? throw new ArgumentNullException(nameof(dataService));
            _definitionSupportService = definitionSupportService ?? throw new ArgumentNullException(nameof(definitionSupportService));
        }

        [HttpGet("{id}/usage")]
        [ProducesResponseType(typeof(WrappedServiceResult<ImageUsageCollection>), (int)HttpStatusCode.OK)]
        public AggregatorUsageCollection GetAggregatorUsage(string id) => _definitionSupportService.GetAggregatorUsage(id);


        [HttpGet("search")]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        [ProducesResponseType(typeof(WrappedServiceResult<IEnumerable<AggregatorDefinition>>), (int)HttpStatusCode.OK)]
        public IEnumerable<AggregatorDefinition> List(string filter = null,
                                                      FilterMatchMode filterMatchMode = FilterMatchMode.Contains,
                                                      [FromQuery] string[] tags = null,
                                                      TagsMatchMode tagsMatchMode = TagsMatchMode.Any,
                                                      int? pageIndex = null, int? pageSize = null) => _dataService.ListAggregators(filter, filterMatchMode, tags, tagsMatchMode, pageIndex, pageSize);

        [HttpGet("{id}")]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        [ProducesResponseType(typeof(WrappedServiceResult<AggregatorDefinition>), (int)HttpStatusCode.OK)]
        public AggregatorDefinition GetById(string id) => _dataService.GetAggregator(id);

        [HttpPost]
        [ProducesResponseType(typeof(WrappedServiceResult<AggregatorDefinition>), (int)HttpStatusCode.OK)]
        public AggregatorDefinition Create([FromBody] AggregatorDefinition aggregator) => _dataService.CreateAggregator(aggregator);

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(WrappedServiceResult<AggregatorDefinition>), (int)HttpStatusCode.OK)]
        public AggregatorDefinition Update(string id, [FromBody] AggregatorDefinition aggregator) => _dataService.UpdateAggregator(id, aggregator);

        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(WrappedServiceResult<bool>), (int)HttpStatusCode.OK)]
        public bool Delete(string id) => _dataService.DeleteAggregator(id);

    }
}
