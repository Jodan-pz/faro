using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using FARO.Common;
using FARO.Common.Domain;
using FARO.Common.Exceptions;
using FARO.WebApi.Filters;
using Microsoft.AspNetCore.Mvc;


namespace FARO.WebApi.Controllers.V1 {
    [Route("api/v1/[controller]")]
    [ApiController]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
    public class FlowController : ControllerBase {
        readonly IDefinitionDataService _definitionDataService;
        readonly IFlowConfigurationBuilder _flowConfigBuilder;
        readonly IFlowRunner _flowRunner;
        readonly IDefinitionSupportService _definitionSupportService;
        readonly IIntegrityCheckService _integrityCheckService;

        public FlowController(IDefinitionDataService definitionDataService,
                              IDefinitionSupportService definitionSupportService,
                              IFlowConfigurationBuilder flowConfigNuilder,
                              IFlowRunner flowRunner,
                              IIntegrityCheckService integrityCheckService) {
            _definitionDataService = definitionDataService ?? throw new ArgumentNullException(nameof(definitionDataService));
            _definitionSupportService = definitionSupportService ?? throw new ArgumentNullException(nameof(definitionSupportService));
            _flowConfigBuilder = flowConfigNuilder ?? throw new ArgumentNullException(nameof(flowConfigNuilder));
            _flowRunner = flowRunner ?? throw new ArgumentNullException(nameof(flowRunner));
            _integrityCheckService = integrityCheckService ?? throw new ArgumentNullException(nameof(integrityCheckService));
        }

        [HttpGet("{id}/check")]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        [ProducesResponseType(typeof(WrappedServiceResult<CheckResultCollection>), (int)HttpStatusCode.OK)]
        public CheckResultCollection CheckIntegrity(string id) => _integrityCheckService.CheckFlowItem(id);

        [HttpGet("{id}/rundef")]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        [ProducesResponseType(typeof(WrappedServiceResult<FlowItemRunDefinition>), (int)HttpStatusCode.OK)]
        public FlowItemRunDefinition GetRunDefinitionById(string id) {
            var flowRunDefinition = new FlowItemRunDefinition
            {
                FlowItem = _definitionDataService.GetFlowItem(id) ?? throw new NullReferenceException($"Cannot find flow item with id: {id}")
            };
            if (flowRunDefinition.FlowItem.ImageId != null) {
                var image = _definitionDataService.GetImage(flowRunDefinition.FlowItem.ImageId) ?? throw new NullReferenceException($"Cannot find image with id: {flowRunDefinition.FlowItem.ImageId}");
                flowRunDefinition.ImageArguments = _definitionSupportService.GetImageArguments(image);
            }
            if (flowRunDefinition.FlowItem.WriterId != null) {
                var writer = _definitionDataService.GetWriter(flowRunDefinition.FlowItem.WriterId) ?? throw new NullReferenceException($"Cannot find writer with id: {flowRunDefinition.FlowItem.WriterId}");
                flowRunDefinition.WriterArguments = writer.Arguments?.Select(a => new ArgumentValue(a));
            }
            return flowRunDefinition;
        }

        [HttpPost("run")]
        [WrappedServiceResultIgnore]
        [Produces("application/octet-stream", "application/json")]

        public ActionResult Run([FromBody] FlowItemRunDefinition runDefinition) {
            try {
                FileStreamResult ret = null;
                var resultStream = new MemoryStream();
                _flowConfigBuilder.Build(runDefinition.FlowItem)
                                  .WithImagePersister(runDefinition.Persister?.Enabled, runDefinition.Persister?.BuildStep)
                                  .WithArguments(runDefinition.ImageArguments, runDefinition.WriterArguments)
                                  .One((item, itemArgs, writerArgs) => {
                                      var streamInfo = _flowRunner.Run(item, resultStream, itemArgs, writerArgs, runDefinition.KeysLimit);
                                      if (resultStream.CanRead) {
                                          resultStream.Seek(0, SeekOrigin.Begin);
                                          if (streamInfo != null) {
                                              ret = File(resultStream, streamInfo.ContentType, $"{streamInfo.FileName ?? runDefinition.FlowItem.Name}.{streamInfo.FileExtension}");
                                          } else {
                                              ret = File(resultStream, "application/octet-stream", $"empty_flow_{runDefinition.FlowItem.Id}.txt");
                                          }
                                      }
                                  });

                if (ret is null) return new NoContentResult();
                Response.Headers.Add("Access-Control-Expose-Headers", "Content-Disposition"); // allow cors access to needed header
                return ret;
            } catch (AggregateException ae) {
                var aggExMess = new StringBuilder();
                foreach (var aggEx in ae.Flatten().InnerExceptions)
                    aggExMess.AppendLine(aggEx.Message);
                return StatusCode((int)HttpStatusCode.InternalServerError, aggExMess.ToString());
            } catch (ValidateResultException vex) {
                var validationErrorMessage = new StringBuilder();
                validationErrorMessage.AppendLine($"Error running flow '{runDefinition.FlowItem.Name}' - {vex.Message} ");
                if (vex.Result.Any()) {
                    foreach (var err in vex.Result) { 
                        if (err.Context == ValidatorMessageDefaultContext.GENERIC_ERROR_RAW_VALUES)
                            validationErrorMessage.AppendLine($"[{err.Key}] {err.Message[..80]}");
                        else
                            validationErrorMessage.AppendLine($"[{err.Key}] {err.Message}");
                    }
                }
                return StatusCode((int)HttpStatusCode.InternalServerError, validationErrorMessage.ToString());
            } catch (Exception ex) {
                return StatusCode((int)HttpStatusCode.InternalServerError,
                                  $"Error running flow '{runDefinition.FlowItem.Name}' - {ex.Message}");
            }
        }

        [HttpGet("search")]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        [ProducesResponseType(typeof(WrappedServiceResult<IEnumerable<FlowItemDefinition>>), (int)HttpStatusCode.OK)]
        public IEnumerable<FlowItemDefinition> List(string filter = null,
                                                    FilterMatchMode filterMatchMode = FilterMatchMode.Contains,
                                                    [FromQuery] string[] tags = null,
                                                    TagsMatchMode tagsMatchMode = TagsMatchMode.Any,
                                                    int? pageIndex = null, int? pageSize = null) => _definitionDataService.ListFlowItems(filter, filterMatchMode, tags, tagsMatchMode, pageIndex, pageSize);

        [HttpGet("{id}")]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        [ProducesResponseType(typeof(WrappedServiceResult<FlowItemDefinition>), (int)HttpStatusCode.OK)]
        public FlowItemDefinition GetById(string id) => _definitionDataService.GetFlowItem(id);

        [HttpPost]
        [ProducesResponseType(typeof(WrappedServiceResult<FlowItemDefinition>), (int)HttpStatusCode.OK)]
        public FlowItemDefinition Create([FromBody] FlowItemDefinition flowItem) => _definitionDataService.CreateFlowItem(flowItem);

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(WrappedServiceResult<FlowItemDefinition>), (int)HttpStatusCode.OK)]
        public FlowItemDefinition Update(string id, [FromBody] FlowItemDefinition flowItem) => _definitionDataService.UpdateFlowItem(id, flowItem);

        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(WrappedServiceResult<bool>), (int)HttpStatusCode.OK)]
        public bool Delete(string id) => _definitionDataService.DeleteFlowItem(id);
    }
}
