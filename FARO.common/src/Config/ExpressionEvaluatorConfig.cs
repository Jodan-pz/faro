using Microsoft.Extensions.Configuration;

namespace FARO.Common {
    public enum ExpressionEvaluatorConfigKind { Default, External }
    public class ExpressionEvaluatorConfig {
        const string SECTION = "FARO:expression";

        public static ExpressionEvaluatorConfig FromConfiguration(IConfiguration config) {
            var expressionEvaluatorSection = config.GetSection(SECTION);
            var expressionEvaluatorConfig = new ExpressionEvaluatorConfig();
            try {
                expressionEvaluatorSection.Bind(expressionEvaluatorConfig);
            } catch { /* wrong configuration */
                return null;
            }
            return expressionEvaluatorConfig;
        }
        public ExpressionEvaluatorConfigKind Kind { get; set; }
        public string Assembly { get; set; }
        public string Class { get; set; }
        public bool WebApiScoped { get; set; }
    }
}
