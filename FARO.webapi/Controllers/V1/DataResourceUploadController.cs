using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System;
using Microsoft.AspNetCore.Http;
using FARO.WebApi.Filters;
using FARO.Common;

namespace FARO.WebApi.Controllers.V1 {

    public class UploadData {
        public string Kind { get; set; }
        public string RelativePath { get; set; }
        public IFormFile File { get; set; }
    }

    [Route("api/v1/[controller]")]
    [ApiController]
    public class DataResourceController : ControllerBase {
        private readonly IAppSupport _appsupport;

        public DataResourceController(IAppSupport appsupport) {
            _appsupport = appsupport ?? throw new ArgumentNullException(nameof(appsupport));
        }

        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(104_857_600)]
        [WrappedServiceResultIgnore]
        public async Task<IActionResult> UploadData([FromForm] UploadData formData) {
            // Check if the request contains multipart/form-data.
            if (formData.File == null) {
                return new UnsupportedMediaTypeResult();
            }

            if (formData.File.Length > 0) {
                var formFile = formData.File;
                var rootPath = formData.Kind.ToLower().Trim() switch
                {
                    "decorator" => _appsupport.DecoratorsDataRootPath,
                    "keysiterator" => _appsupport.KeysIteratorsDataRootPath,
                    "aggregator" => _appsupport.AggregatorsDataRootPath,
                    "validator" => _appsupport.ValidatorsDataRootPath,
                    "writer" => _appsupport.WritersDataRootPath,
                    _ => throw new ApplicationException($"Unsupported upload kind {formData.Kind}")
                };
                var folderPath = Path.Combine(rootPath, formData.RelativePath ?? "upload");
                var filePath = Path.Combine(folderPath, formFile.FileName);

                if (!Directory.Exists(folderPath)) {
                    Directory.CreateDirectory(folderPath);
                }
                using var fileStream = new FileStream(filePath, FileMode.Create);
                await formFile.CopyToAsync(fileStream);
                fileStream.Flush();
                return Ok(new { status = "Upload Success", length = formFile.Length, name = formFile.FileName });
            } else {
                return NotFound("Failed to upload");
            }
        }
    }
}
