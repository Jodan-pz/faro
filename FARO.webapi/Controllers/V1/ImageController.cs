using System;
using System.Collections;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;

using Microsoft.AspNetCore.Mvc;

using FARO.Common;
using FARO.Common.Domain;
using FARO.Common.Helpers;

using FARO.WebApi.Filters;
using static FARO.Common.Constants;
using FARO.Common.Exceptions;

namespace FARO.WebApi.Controllers.V1 {
    [Route("api/v1/[controller]")]
    [ApiController]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
    public class ImageController : ControllerBase {
        readonly IDefinitionDataService _definitionDataService;
        readonly IFlowConfigurationBuilder _flowConfigBuilder;
        readonly IDefinitionSupportService _definitionSupportService;
        readonly IIntegrityCheckService _integrityCheckService;
        readonly IFlowItemImagePersister _imagePersister;

        public ImageController(IDefinitionDataService definitionDataService,
                               IDefinitionSupportService definitionSupportService,
                               IFlowConfigurationBuilder flowConfigBuilder,
                               IIntegrityCheckService integrityCheckService,
                               IFlowItemImagePersister imagePersister = null) {
            _definitionDataService = definitionDataService ?? throw new ArgumentNullException(nameof(definitionDataService));
            _definitionSupportService = definitionSupportService ?? throw new ArgumentNullException(nameof(definitionSupportService));
            _flowConfigBuilder = flowConfigBuilder ?? throw new ArgumentNullException(nameof(flowConfigBuilder));
            _integrityCheckService = integrityCheckService ?? throw new ArgumentNullException(nameof(integrityCheckService));
            _imagePersister = imagePersister;
        }

        [HttpGet("{id}/usage")]
        [ProducesResponseType(typeof(WrappedServiceResult<ImageUsageCollection>), (int)HttpStatusCode.OK)]
        public ImageUsageCollection GetImageUsage(string id) => _definitionSupportService.GetImageUsage(id);

        [HttpGet("{id}/check")]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        [ProducesResponseType(typeof(WrappedServiceResult<CheckResultCollection>), (int)HttpStatusCode.OK)]
        public CheckResultCollection CheckIntegrity(string id) => _integrityCheckService.CheckImage(id);

        [HttpGet("{id}/builddef")]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        [ProducesResponseType(typeof(WrappedServiceResult<ImageBuildDefinition>), (int)HttpStatusCode.OK)]
        public ImageBuildDefinition GetBuildDefinitionById(string id) {
            var imageBuildDefinition = new ImageBuildDefinition();
            var image = _definitionDataService.GetImage(id);
            if (image != null) {
                imageBuildDefinition.Image = image;
                imageBuildDefinition.Arguments = _definitionSupportService.GetImageArguments(image);
                imageBuildDefinition.AvailableAggregators = _definitionDataService.GetImageAggregators(id);
                imageBuildDefinition.AvailableValidators = _definitionSupportService.ListImageCompatibleValidators(id);
            }
            return imageBuildDefinition;
        }

        [HttpPost("persisterstate")]
        [ProducesResponseType(typeof(WrappedServiceResult<FlowItemImagePersisterState>), (int)HttpStatusCode.OK)]
        public FlowItemImagePersisterState GetPersisterState([FromBody] ImageBuildDefinition imageBuildDefinition) {
            FlowItemImagePersisterState ret = null;
            _flowConfigBuilder.Build(imageDefinition: imageBuildDefinition.Image, aggregatorDefinition: imageBuildDefinition.Aggregator)
                              .WithImagePersister(imageBuildDefinition.Persister?.Enabled, imageBuildDefinition.Persister?.BuildStep)
                              .WithArguments(imageBuildDefinition.Arguments, null)
                              .One((item, itemArgs, _) => {
                                  ret = _imagePersister?.GetPersisterState(item, itemArgs);
                              });
            return ret;
        }

        [HttpPost("build")]
        [ProducesResponseType(typeof(WrappedServiceResult<ImageBuildResult>), (int)HttpStatusCode.OK)]
        public ImageBuildResult Build([FromBody] ImageBuildDefinition imageBuildDefinition) {
            IImageOutput output = new ImageOutput();
            var imageWatcherItems = new ConcurrentBag<ImageWatcherItemLog>();
            var ret = new ImageBuildResult
            {
                Rows = new List<IDictionary<string, object>>(),
                ImageWatcherItemLogs = imageWatcherItems
            };
            try {
                _flowConfigBuilder.Build(imageBuildDefinition.Image, imageBuildDefinition.Validator, imageBuildDefinition.Aggregator)
                                  .WithImagePersister(imageBuildDefinition.Persister?.Enabled, imageBuildDefinition.Persister?.BuildStep)
                                  .WithArguments(imageBuildDefinition.Arguments, null)
                                  .One((item, itemArgs, _) => {
                                      output = _imagePersister?.Init(item, itemArgs) ?? output;
                                      item.Image.BuildSchema();
                                      if (imageBuildDefinition.EnableWatch ?? false) {
                                          item.Image.OnWatchItem = (wi) => {
                                              var totMillSecs = (wi.Stop - wi.Start).TotalMilliseconds;
                                              imageWatcherItems.Add(new ImageWatcherItemLog
                                              {
                                                  ImageName = wi.Image.Name,
                                                  LayerName = wi.Layer.Name,
                                                  DecoratorName = wi.Decorator.Definition.Name,
                                                  Field = wi.FieldName,
                                                  Start = wi.Start,
                                                  Stop = wi.Stop,
                                                  TotalMilliseconds = totMillSecs < 0 ? 0 : totMillSecs
                                              });
                                          };
                                      }
                                      // execute iterator
                                      item.Image.IterateKeys(itemArgs, key => {
                                          // add row with key (args+result)
                                          output.AddKey(key);
                                          return (imageBuildDefinition.KeysLimit ?? 0) <= 0 || output.Size < imageBuildDefinition.KeysLimit;
                                      });
                                      // eval rows
                                      ParallelHelper.ForEach(output.Partitioner(DEFAULT_PART_CHUNK_SIZE), item.Image.EvalLayers);

                                      // validations                                      
                                      var validate = item.Validator?.Validate(output);
                                      if (validate != null && !validate.Valid) throw new ValidateResultException(item.Validator, validate);

                                      // aggregation
                                      output = item.Aggregator?.Aggregate(output) ?? output;
                                  });

                // fill output
                output.IterateRows(row => ((IList)ret.Rows).Add(row.ToDictionary()));
            } catch (AggregateException ae) {
                var aggExMess = new StringBuilder();
                foreach (var aggEx in ae.Flatten().InnerExceptions)
                    aggExMess.AppendLine(aggEx.Message);
                throw new ApplicationException(aggExMess.ToString());
            } catch (ValidateResultException vex) {
                var validationErrorMessage = new StringBuilder();
                validationErrorMessage.AppendLine($"Error building image '{imageBuildDefinition.Image.Name}' - {vex.Message} ");
                if (vex.Result.Any()) {
                    foreach (var err in vex.Result) {
                        if (err.Context == ValidatorMessageDefaultContext.GENERIC_ERROR_RAW_VALUES)
                            validationErrorMessage.AppendLine($"[{err.Key}] {err.Message[..80]}");
                        else
                            validationErrorMessage.AppendLine($"[{err.Key}] {err.Message}");
                    }
                }
                throw new ApplicationException(validationErrorMessage.ToString());
            }
            return ret;
        }

        [HttpGet("search")]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        [ProducesResponseType(typeof(WrappedServiceResult<IEnumerable<ImageDefinition>>), (int)HttpStatusCode.OK)]
        public IEnumerable<ImageDefinition> List(string filter = null,
                                                 FilterMatchMode filterMatchMode = FilterMatchMode.Contains,
                                                 [FromQuery] string[] tags = null,
                                                 TagsMatchMode tagsMatchMode = TagsMatchMode.Any,
                                                 int? pageIndex = null, int? pageSize = null) => _definitionDataService.ListImages(filter, filterMatchMode, tags, tagsMatchMode, pageIndex, pageSize);

        [HttpGet("{id}")]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        [ProducesResponseType(typeof(WrappedServiceResult<ImageDefinition>), (int)HttpStatusCode.OK)]
        public ImageDefinition GetById(string id) => _definitionDataService.GetImage(id);

        [HttpGet("{id}/aggregators")]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        [ProducesResponseType(typeof(WrappedServiceResult<ImageAggregators>), (int)HttpStatusCode.OK)]
        public ImageAggregators GetAggregatorsById(string id) => new()
        {
            Aggregators = _definitionDataService.GetImageAggregators(id),
            ImageFields = _definitionSupportService.GetImageOutputFields(id)
        };

        [HttpGet("{id}/validators")]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        [ProducesResponseType(typeof(WrappedServiceResult<ImageValidators>), (int)HttpStatusCode.OK)]
        public ImageValidators GetValidatorsById(string id) => new()
        {
            Validators = _definitionSupportService.ListImageCompatibleValidators(id),
            ImageFields = _definitionSupportService.GetImageOutputFields(id)
        };

        [HttpGet("{id}/writers")]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        [ProducesResponseType(typeof(WrappedServiceResult<IEnumerable<WriterDefinition>>), (int)HttpStatusCode.OK)]
        public IEnumerable<WriterDefinition> GetWritersById(string id, string aggregatorId = null) => _definitionSupportService.ListImageCompatibleWriters(id, aggregatorId);

        [HttpPost]
        [ProducesResponseType(typeof(WrappedServiceResult<ImageDefinition>), (int)HttpStatusCode.OK)]
        public ImageDefinition Create([FromBody] ImageDefinition image) => _definitionDataService.CreateImage(image);

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(WrappedServiceResult<ImageDefinition>), (int)HttpStatusCode.OK)]
        public ImageDefinition Update(string id, [FromBody] ImageDefinition image) => _definitionDataService.UpdateImage(id, image);

        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(WrappedServiceResult<bool>), (int)HttpStatusCode.OK)]
        public bool Delete(string id) => _definitionDataService.DeleteImage(id);

    }
}
