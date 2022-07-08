namespace FARO.Services.Runners {
    class Timings {
        readonly Dictionary<string, TimeSpan?> _timings = new();

        public void AddCheck(TimeSpan? time) => _timings["check"] = time;
        public void AddPersister(TimeSpan? time) => _timings["persister"] = time;
        public void AddSchema(TimeSpan? time) => _timings["schema"] = time;
        public void AddKeys(TimeSpan? time) => _timings["keys"] = time;
        public void AddImage(TimeSpan? time) => _timings["image"] = time;
        public void OnValidator(TimeSpan? time) => _timings["validator"] = time - _timings["image"];
        public void OnAggregator(TimeSpan? time) => _timings["aggregator"] = time - (_timings["image"] + _timings["validator"]);
        public void OnWriter(TimeSpan? time) => _timings["writer"] = time - (_timings["image"] + _timings["validator"] + _timings["aggregator"]);

        public IDictionary<string, TimeSpan?> Values => _timings;
    }
}