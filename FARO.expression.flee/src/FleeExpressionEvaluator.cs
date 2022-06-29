using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.RegularExpressions;

using FARO.Common;
using FARO.Common.Helpers;

using Flee.PublicTypes;

namespace FARO.Expression {
    public sealed class FleeExpressionEvaluator : IExpressionEvaluator {
        const char PARSER_FUNC_ARG_SEPA = ';';
        const char PARSER_DECIMAL_POINT = '.';
        const string MATCH_CONDITION_TAG = "@match:";
        const string KEY_FIELD_EVAL_PREFIX = "_____FARO_KEY_FIELD_EVAL_____";
        static readonly Regex matchCurlyBraces = new(@"\{([\w#:\- ]*)\}", RegexOptions.Compiled);

        static readonly ExpressionContext expressionContext;

        static FleeExpressionEvaluator() {
            expressionContext = new ExpressionContext();
            expressionContext.ParserOptions.FunctionArgumentSeparator = PARSER_FUNC_ARG_SEPA;
            expressionContext.ParserOptions.DecimalSeparator = PARSER_DECIMAL_POINT;
            expressionContext.Imports.AddType(typeof(CustomExpressionFunctions));
            expressionContext.Imports.AddType(typeof(Math));
            expressionContext.Imports.AddType(typeof(DateTime));
            expressionContext.ParserOptions.RecreateParser();
        }

        public void ForEachField(string expression, Action<string, string, object[]> action, params object[] args) {
            if (expression == null) return;
            if (IsMatchCondition(expression, out var match)) {
                var fields = expression[MATCH_CONDITION_TAG.Length..].Split(PARSER_FUNC_ARG_SEPA).Select(s => s.Split('='));
                foreach (var fieldMatch in fields) action?.Invoke(fieldMatch[0], fieldMatch[0], args);
            } else {
                var fields = matchCurlyBraces.Matches(expression).Cast<Match>().Select(m => m.Groups[1].Value).ToArray();
                foreach (var fieldMatch in fields) action?.Invoke(fieldMatch, $"{{{fieldMatch}}}", args);
            }
        }

        public bool EvalCondition(string condition, ImageOutputRow row) {
            if (IsNullOrEmpty(condition)) return true;
            if (IsMatchCondition(condition, out var match)) {
                return EvalMatchCondition(key => row.ContainsName(key) ? row.GetValueExact(key) : null, match);
            }
            return EvalCondition(key => row.ContainsName(key) ? row.GetValueExact(key) : null, condition);
        }

        public bool EvalCondition(string condition, IDictionary<string, object> values) {
            if (IsNullOrEmpty(condition)) return true;
            if (IsMatchCondition(condition, out var match)) {
                return EvalMatchCondition(key => values.ContainsKey(key) ? values[key] : null, match);
            }
            return EvalCondition(key => values.ContainsKey(key) ? values[key] : null, condition);
        }

        public object EvalExpression(object expression, ImageOutputRow row) {
            if (expression is string strExpr) {
                lock (expressionContext) {
                    var toCompile = PrepareExpressionContext(key => row.ContainsName(key) ? row.GetValueExact(key) : null, strExpr);
                    var compiled = expressionContext.CompileDynamic(toCompile);
                    return compiled.Evaluate();
                }
            }
            return expression;
        }

        internal static bool IsNullOrEmpty(object value) => string.IsNullOrEmpty(value?.ToString().Trim());

        static bool IsMatchCondition(string condition, out string match) {
            match = null;
            if (condition.StartsWith(MATCH_CONDITION_TAG)) {
                match = condition[MATCH_CONDITION_TAG.Length..];
                return true;
            }
            return false;
        }

        static bool EvalMatchCondition(Func<string, object> valueRetriever, string match) {
            var whereSplitted = match?.Split(PARSER_FUNC_ARG_SEPA);
            if (whereSplitted != null) {
                foreach (var clause in whereSplitted) {
                    var matchPair = clause.Split('=');
                    if (matchPair.Length == 2) {
                        var whereKey = matchPair.First();
                        object whereValue = matchPair.Last();
                        if (!Equals(valueRetriever(whereKey), whereValue)) return false;
                    }
                }
            }
            return true;
        }

        bool EvalCondition(Func<string, object> valueRetriever, string condition) {
            lock (expressionContext) {
                var toCompile = PrepareExpressionContext(valueRetriever, condition);
                var compiled = expressionContext.CompileGeneric<bool>(toCompile);
                return compiled.Evaluate();
            }
        }

        string PrepareExpressionContext(Func<string, object> valueRetriever, string expression) {
            var vars = expressionContext.Variables;
            vars.Clear();
            ForEachField(expression, (field, orig, _) => {
                var varValue = valueRetriever.Invoke(field);
                if (PrefixHelper.IsKeyName(field, out var keyName)) field = $"{KEY_FIELD_EVAL_PREFIX}{keyName}";
                field = field.Replace(" ", "_");
                if (!vars.ContainsKey(field) && varValue != null) vars.Add(field, varValue);
                expression = expression.Replace(orig, varValue != null ? field : "null");
            });
            expression = expression.Replace("'", @"""");
            return expression;
        }
    }

    public static class CustomExpressionFunctions {
        static readonly Random random = new();
        public static int Random(int min, int max) => random.Next(min, max + 1);

        public static string Substring(string value) => Substring(value, 0, value?.Length);
        public static string Substring(string value, int from) => Substring(value, from, value?.Length);
        public static string Substring(string value, int from, int? length) {
            if (value == null) return value;
            if (length == null || (from + length > value.Length)) length = value.Length - from;
            return value.Substring(from, length.Value);
        }
        public static object Coalesce(params object[] parms) => parms?.FirstOrDefault(o => o != null);
        public static object Iif(bool condition, object trueReturn, object falseReturn) => condition ? trueReturn : falseReturn;
        public static object ParseDate(object dateToParse, string format) => ParseDate(dateToParse?.ToString(), format);
        public static object ParseDate(string dateToParse, string format) {
            if (dateToParse == null) return null;
            if (DateTime.TryParseExact(dateToParse, format, CultureInfo.InvariantCulture, DateTimeStyles.None, out var result)) return result;
            return dateToParse;
        }
        public static bool IsGreaterInMonths(object dateFrom, object dateTo, int months) {
            if (dateFrom == null || dateTo == null) return false;
            var df = dateFrom is DateTime;
            var dt = dateTo is DateTime;
            if (!df || !dt) return false;
            return ((DateTime)dateFrom).AddMonths(months) < ((DateTime)dateTo);
        }
        public static object IfNull(object value, object defaultValue) => value ?? defaultValue;
        public static bool IsNull(object value) => value == null;
        public static bool IsNullOrEmpty(object value) => FleeExpressionEvaluator.IsNullOrEmpty(value);
        public static NullVariable NullVar(object value) => new(value);
    }
}
