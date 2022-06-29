using System.Net;
using System.Net.Http.Headers;
using System.Net.Mime;

using FARO.Common;
using FARO.Common.Exceptions;
using FARO.Common.Helpers;

using Newtonsoft.Json.Linq;

using static FARO.Addons.Http.WebApiSourceHelper;
using static FARO.Addons.Common.DynamicHelper;
namespace FARO.Addons.Http.Decorators.Engine {
    public class WebApiDecoratorEngine : IDecoratorEngine {
        private readonly IExpressionEvaluator _expressionEvaluator;
        readonly IConnectionRetriever? _connectionRetriever;

        public WebApiDecoratorEngine(IExpressionEvaluator expressionEvaluator, IConnectionRetriever? connectionRetriever) {
            _expressionEvaluator = expressionEvaluator ?? throw new ArgumentNullException(nameof(expressionEvaluator));
            _connectionRetriever = connectionRetriever;
        }

        public async Task<IDictionary<string, object?>> GetValuesAsync(IDecorator decorator, ImageOutputRow imageOutputRow, IDataResourceService dataResource) {
            IDictionary<string, object?> ret = new Dictionary<string, object?>();
            (var server, var method,
             var action, var queryString,
             var httpClientHandler,
             var headers,
             var jsonPath) = GetWebApiSourceConfig(decorator.Definition.Source, _connectionRetriever);

            if (HttpMethod.Get.Method.Equals(method)) {
                if (decorator.Arguments?.Any() ?? false) {
                    var dicArgValues = new Dictionary<string, object?>();
                    foreach (var arg in decorator.Arguments) {
                        var argValue = imageOutputRow.GetValue(arg.Value ?? $"{{{arg.Name}}}");
                        if (!arg.Optional && argValue == null) throw new NullArgumentValueException(decorator, arg.Name, imageOutputRow);
                        queryString = queryString?.Replace("{" + arg.Name + "}", WebUtility.UrlEncode(argValue?.ToString() ?? string.Empty));
                        action = action.Replace("{" + arg.Name + "}", argValue?.ToString() ?? string.Empty);
                        dicArgValues.Add(arg.Name, argValue);
                    }
                    if (!_expressionEvaluator.EvalCondition(decorator.Definition.When, dicArgValues)) {
                        FillEmptyResult(decorator, ret);
                        return ret;
                    }
                }

                using var client = new HttpClient(httpClientHandler);
                foreach (var header in headers) client.DefaultRequestHeaders.Add(header.Key, header.Value);
                if (!client.DefaultRequestHeaders.Accept.Any()) {
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue(MediaTypeNames.Application.Json));
                }
                var requestUrl = $"{server}/{action}?{queryString}";
                var response = await client.GetAsync(requestUrl);
                if (response.IsSuccessStatusCode) {
                    var result = await response.Content.ReadAsStringAsync();
                    if (!(decorator.Definition.Fields?.Any() ?? false)) {
                        ret.Add("result", result);
                    } else {
                        var token = JToken.Parse(result);
                        if (!string.IsNullOrEmpty(jsonPath)) token = token.SelectToken(jsonPath);
                        foreach (var field in decorator.Definition.Fields) {
                            object? fieldValue = null;
                            if (field.Value != null) {
                                fieldValue = ChangeType(field.Value, field.Type);
                            } else {
                                var valueToken = token?.SelectTokens(field.SelectorOrName);
                                if (valueToken?.Any() ?? false) {
                                    fieldValue = ChangeType(valueToken.First().Value<JValue>()?.Value, field.Type);
                                }
                            }
                            if (fieldValue != null && !MiscHelper.IsNullOrEmpty(field.Format)) fieldValue = string.Format("{0:" + field.Format + "}", fieldValue);

                            ret.Add(field.Name, fieldValue);
                        }
                    }
                } else {
                    FillEmptyResult(decorator, ret);
                }
            }
            return ret;
        }

        private static void FillEmptyResult(IDecorator decorator, IDictionary<string, object?> result) {
            foreach (var field in decorator.Definition.Fields) {
                result.Add(field.Name, null);
            }
        }
    }
}
