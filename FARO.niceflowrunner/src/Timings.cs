namespace FARO.Services.Runners {
    class Timings {
        Dictionary<string, TimeSpan?> timings = new();

        public void AddCheck(TimeSpan? time) => timings["check"] = time;
        public void AddPersister(TimeSpan? time) => timings["persister"] = time;
        public void AddSchema(TimeSpan? time) => timings["schema"] = time;
        public void AddKeys(TimeSpan? time) => timings["keys"] = time;
        public void AddImage(TimeSpan? time) => timings["image"] = time;
        public void OnValidator(TimeSpan? time) => timings["validator"] = time - timings["image"];
        public void OnAggregator(TimeSpan? time) => timings["aggregator"] = time - (timings["image"] + timings["validator"]);
        public void OnWriter(TimeSpan? time) => timings["writer"] = time - (timings["image"] + timings["validator"] + timings["aggregator"]);

        public IDictionary<string, TimeSpan?> Values => timings;
    }
}