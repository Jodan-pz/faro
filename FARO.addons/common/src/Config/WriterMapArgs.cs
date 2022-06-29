namespace FARO.Addons.Common.Config {

    public static class WriterMapArgs {
        public static IDictionary<string, object> MapArgs(Dictionary<string, string>? mappedArgs, IDictionary<string, object>? args) {
            if (args is null) return new Dictionary<string, object>();
            if (mappedArgs is null) return args;
            Dictionary<string, object> ret = new();
            foreach (var arg in args) {
                foreach ((var key, var value) in mappedArgs) {
                    if (value == arg.Key) {
                        ret.Add(key, args[value]);
                    } else if (!ret.ContainsKey(arg.Key)) {
                        ret.Add(arg.Key, arg.Value);
                    }
                }
            }
            return ret;
        }

    }
}
