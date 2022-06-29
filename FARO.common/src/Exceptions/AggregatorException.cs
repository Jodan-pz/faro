using System;
using System.Diagnostics;
using System.Linq;
using System.Text;

namespace FARO.Common.Exceptions {
    public class AggregatorException : Exception {
        public AggregatorException(string message) : base(message) { }
        public AggregatorException(string message, Exception innerException) : base(message, innerException) { }

        public AggregatorException(IAggregator aggregator, IImageOutput output, Exception innerException)
        : this(BuildMessage(aggregator, output, innerException)) { }

        private static string BuildMessage(IAggregator aggregator, IImageOutput output, Exception innerException) {
            var sb = new StringBuilder();
            sb.AppendLine("-=== AGGREGATOR ERROR DETAILS ===-");
            sb.AppendLine(aggregator.ToString());
            if (output.Size > 0) {
                var part = output.Partitioner(1).GetPartitions(1).First(); part.MoveNext();
                var exampleRow = part.Current;
                sb.AppendLine($"[AGGR] IMAGE ROW FIELDS:");
                foreach (var kv in exampleRow.ToDictionary()) {
                    sb.AppendLine($"{kv.Key}");
                }
            }
            sb.AppendLine($"[AGGR] MESSAGE: {innerException.Message}");
            sb.AppendLine(new string('-', 80));
            sb.AppendLine($"[AGGR] STACK: {innerException.Demystify()}");
            sb.AppendLine(new string('-', 80));
            return sb.ToString();
        }
    }
}
