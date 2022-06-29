namespace FARO.Services.Validators.Engine.Default {
    public class DefaultValidatorConfigRule {
        public string Name { get; set; }
        public string Expression { get; set; }
        public string Context { get; set; }
        public string Message { get; set; }

        public override string ToString() => $"{Name} -> {Expression}";
    }
}
