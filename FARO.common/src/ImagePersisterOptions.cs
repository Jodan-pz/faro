using System.Text;

namespace FARO.Common {
    public class ImagePersisterOptions {
        public bool Enabled { get; set; }
        public string BuildStep { get; set; }

        public override string ToString() {
            var sb = new StringBuilder();
            // dump image infos.
            sb.AppendLine();
            sb.AppendLine(new string('-', 80));
            sb.AppendLine($"Image Persister is {(Enabled ? "Enabled" : "Disabled")}, build step: {BuildStep ?? "<<< not configured >>>"}");
            sb.AppendLine(new string('-', 80));
            return sb.ToString();
        }
    }
}