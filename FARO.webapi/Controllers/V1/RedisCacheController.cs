using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Redis;
using Microsoft.Extensions.Options;
using StackExchange.Redis;
using FARO.WebApi.Filters;

namespace FARO.WebApi.Controllers.V1 {
    [Route("api/v1/[controller]")]
    [ApiController]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
    public class RedisCacheController : ControllerBase {
        readonly RedisCacheOptions _redisCacheOptions;

        public RedisCacheController(IOptions<RedisCacheOptions> redisCacheOptions) {
            _redisCacheOptions = redisCacheOptions?.Value;
        }

        [HttpGet]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        [ProducesResponseType(typeof(WrappedServiceResult<bool>), (int)HttpStatusCode.OK)]
        public bool IsConfigured() => _redisCacheOptions?.Configuration != null;

        [HttpDelete]
        public async Task Clear() {
            if (!IsConfigured()) return;
            using var connection = await ConnectionMultiplexer.ConnectAsync($"{_redisCacheOptions.Configuration},allowAdmin=true");
            var server = connection.GetServer(_redisCacheOptions.Configuration);
            server?.FlushDatabase();
        }
    }
}
