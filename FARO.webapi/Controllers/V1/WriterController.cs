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
    public class WriterController : ControllerBase {
        readonly IDefinitionDataService _dataService;
        readonly IDefinitionSupportService _definitionSupportService;

        public WriterController(IDefinitionDataService dataService,
                                IDefinitionSupportService definitionSupportService) {
            _dataService = dataService ?? throw new ArgumentNullException(nameof(dataService));
            _definitionSupportService = definitionSupportService ?? throw new ArgumentNullException(nameof(definitionSupportService));
        }

        [HttpGet("{id}/usage")]
        [ProducesResponseType(typeof(WrappedServiceResult<WriterUsageCollection>), (int)HttpStatusCode.OK)]
        public WriterUsageCollection GetWriterUsage(string id) => _definitionSupportService.GetWriterUsage(id);

        [HttpGet("search")]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        [ProducesResponseType(typeof(WrappedServiceResult<IEnumerable<WriterDefinition>>), (int)HttpStatusCode.OK)]
        public IEnumerable<WriterDefinition> List(string filter = null,
                                                  FilterMatchMode filterMatchMode = FilterMatchMode.Contains,
                                                  [FromQuery] string[] tags = null,
                                                  TagsMatchMode tagsMatchMode = TagsMatchMode.Any,
                                                  int? pageIndex = null, int? pageSize = null) => _dataService.ListWriters(filter, filterMatchMode, tags, tagsMatchMode, pageIndex, pageSize);

        [HttpGet("{id}")]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        [ProducesResponseType(typeof(WrappedServiceResult<WriterDefinition>), (int)HttpStatusCode.OK)]
        public WriterDefinition GetById(string id) => _dataService.GetWriter(id);

        [HttpPost]
        [ProducesResponseType(typeof(WrappedServiceResult<WriterDefinition>), (int)HttpStatusCode.OK)]
        public WriterDefinition Create([FromBody] WriterDefinition writer) => _dataService.CreateWriter(writer);

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(WrappedServiceResult<WriterDefinition>), (int)HttpStatusCode.OK)]
        public WriterDefinition Update(string id, [FromBody] WriterDefinition writer) => _dataService.UpdateWriter(id, writer);

        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(WrappedServiceResult<bool>), (int)HttpStatusCode.OK)]
        public bool Delete(string id) => _dataService.DeleteWriter(id);
    }
}
