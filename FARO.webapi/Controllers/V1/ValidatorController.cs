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
    public class ValidatorController : ControllerBase {
        readonly IDefinitionDataService _dataService;
        readonly IDefinitionSupportService _definitionSupportService;

        public ValidatorController(IDefinitionDataService dataService,
        IDefinitionSupportService definitionSupportService) {
            _dataService = dataService ?? throw new ArgumentNullException(nameof(dataService));
            _definitionSupportService = definitionSupportService ?? throw new ArgumentNullException(nameof(definitionSupportService));
        }


        [HttpGet("{id}/usage")]
        [ProducesResponseType(typeof(WrappedServiceResult<ValidatorUsageCollection>), (int)HttpStatusCode.OK)]
        public ValidatorUsageCollection GetValidatorUsage(string id) => _definitionSupportService.GetValidatorUsage(id);

        [HttpGet("search")]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        [ProducesResponseType(typeof(WrappedServiceResult<IEnumerable<ValidatorDefinition>>), (int)HttpStatusCode.OK)]
        public IEnumerable<ValidatorDefinition> List(string filter = null,
                                                     FilterMatchMode filterMatchMode = FilterMatchMode.Contains,
                                                     [FromQuery] string[] tags = null,
                                                     TagsMatchMode tagsMatchMode = TagsMatchMode.Any,
                                                     int? pageIndex = null, int? pageSize = null) => _dataService.ListValidators(filter, filterMatchMode, tags, tagsMatchMode, pageIndex, pageSize);

        [HttpGet("{id}")]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        [ProducesResponseType(typeof(WrappedServiceResult<ValidatorDefinition>), (int)HttpStatusCode.OK)]
        public ValidatorDefinition GetById(string id) => _dataService.GetValidator(id);

        [HttpPost]
        [ProducesResponseType(typeof(WrappedServiceResult<ValidatorDefinition>), (int)HttpStatusCode.OK)]
        public ValidatorDefinition Create([FromBody] ValidatorDefinition validator) => _dataService.CreateValidator(validator);

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(WrappedServiceResult<ValidatorDefinition>), (int)HttpStatusCode.OK)]
        public ValidatorDefinition Update(string id, [FromBody] ValidatorDefinition validator) => _dataService.UpdateValidator(id, validator);

        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(WrappedServiceResult<bool>), (int)HttpStatusCode.OK)]
        public bool Delete(string id) => _dataService.DeleteValidator(id);

    }
}
