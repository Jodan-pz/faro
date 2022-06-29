using System.Net;
using System.Net.Http.Headers;
using System.Net.Mime;

using FARO.Common;
using FARO.Common.Exceptions;

using Newtonsoft.Json.Linq;

using static FARO.Addons.Http.WebApiSourceHelper;
using static FARO.Addons.Common.DynamicHelper;
using FARO.Common.Domain;
using FARO.Common.Helpers;

using Newtonsoft.Json;

namespace FARO.Addons.Http.KeysIterators.Engine {
    public class WebApiKeysIteratorEngine : IKeysIteratorEngine {
        readonly IConnectionRetriever? _connectionRetriever;

        public WebApiKeysIteratorEngine(IConnectionRetriever? connectionRetriever = null) {
            _connectionRetriever = connectionRetriever;
        }

        public IEnumerable<IDictionary<string, object?>> GetKeys(IKeysIterator keysIterator, IDictionary<string, object> args, IDataResourceService dataResource) {
            if (!(keysIterator.Definition.Fields?.Any() ?? false)) yield break;

            (var server, var method,
            var action, var queryString,
            var httpClientHandler,
            var headers,
            var jsonPath) = GetWebApiSourceConfig(keysIterator.Definition.Source, _connectionRetriever);

            if (HttpMethod.Get.Method.Equals(method)) {
                if (keysIterator.Definition.Arguments != null) {
                    foreach (var arg in keysIterator.Definition.Arguments) {
                        var argSel = keysIterator.GetArgumentName(arg.Name);
                        var argValue = args.ContainsKey(argSel) ? args[argSel] : null;
                        if (!arg.Optional && argValue == null) throw new NullArgumentValueException(keysIterator, argSel != arg.Name ? $"{arg.Name} as {argSel}" : argSel, args);
                        queryString = queryString.Replace("{" + arg.Name + "}", WebUtility.UrlEncode(argValue?.ToString() ?? string.Empty));
                        action = action.Replace("{" + arg.Name + "}", argValue?.ToString() ?? string.Empty);
                    }
                }
                using var client = new HttpClient(httpClientHandler);
                foreach (var header in headers) client.DefaultRequestHeaders.Add(header.Key, header.Value);
                if (!client.DefaultRequestHeaders.Accept.Any()) {
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue(MediaTypeNames.Application.Json));
                }
                var requestUrl = $"{server}/{action}?{queryString}";
                var response = client.GetAsync(requestUrl).GetAwaiter().GetResult();
                if (response.IsSuccessStatusCode) {
                    var result = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();
                    IEnumerable<JToken> token = JToken.Parse(result);
                    if (!string.IsNullOrEmpty(jsonPath)) {
                        token = (token as JObject)?.SelectTokens(jsonPath) ?? token;
                        foreach (var key in token) {
                            var ret = new Dictionary<string, object?>();
                            if (keysIterator.Definition.Fields?.Any() ?? false) {
                                foreach (var field in keysIterator.Definition.Fields) {
                                    var fieldName = keysIterator.GetOutputFieldName(field.Name);
                                    var valueToken = key.SelectToken(field.SelectorOrName);
                                    ret.Add(fieldName, GetFieldValue(field, () => valueToken != null, () => valueToken!.Value<JValue>()?.Value));
                                }
                            }
                            yield return ret;
                        }
                    } else {
                        var resDic = JsonConvert.DeserializeObject<IEnumerable<IDictionary<string, object>>>(result);
                        if (resDic is not null) {
                            foreach (var key in resDic) {
                                var ret = new Dictionary<string, object?>();
                                if (keysIterator.Definition.Fields?.Any() ?? false) {
                                    foreach (var field in keysIterator.Definition.Fields) {
                                        var fieldName = keysIterator.GetOutputFieldName(field.Name);
                                        var fieldValue = GetFieldValue(field, () => key.ContainsKey(field.SelectorOrName), () => key[field.SelectorOrName]);
                                        ret.Add(fieldName, fieldValue);
                                    }
                                }
                                yield return ret;
                            }
                        }
                    }
                } else {
                    throw new ApplicationException($"{requestUrl} ({response.ReasonPhrase})");
                }
            }
            yield break;
        }

        static object? GetFieldValue(OutputField field, Func<bool> checkValue, Func<object?> getValue) {
            object? fieldValue = null;
            if (field.Value != null) {
                fieldValue = ChangeType(field.Value, field.Type);
            } else {
                if (checkValue()) {
                    fieldValue = ChangeType(getValue(), field.Type);
                }
            }
            if (fieldValue != null && !MiscHelper.IsNullOrEmpty(field.Format)) fieldValue = string.Format("{0:" + field.Format + "}", fieldValue);
            return fieldValue;
        }
    }
}
