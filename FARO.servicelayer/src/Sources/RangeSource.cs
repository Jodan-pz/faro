using System.Collections.Generic;
using FARO.Common;
using FARO.Common.Domain;

namespace FARO.Services {
    public class RangeSource : IKeysIteratorSource {

        const string ARG_START = "start";
        const string ARG_END = "end";
        const string ARG_STEP = "step";

        public int Start { get; private set; }
        public int End { get; private set; }
        public int Step { get; private set; }

        readonly Argument[] _arguments = {
                                          new Argument{ Name=ARG_START, Description= "Range start number"},
                                          new Argument{ Name=ARG_END, Description ="Range end number"},
                                          new Argument{ Name=ARG_STEP, Description ="Iteration step number"}
                                          };

        public IEnumerable<Argument> Arguments => _arguments;

        public static RangeSource CreateFromDefinition(SourceDefinition source) {
            int start = 1, end = 10, step = 1;
            if (source.Arguments.ContainsKey(ARG_START)) {
                if (!int.TryParse(source.Arguments[ARG_START], out start)) start = 1;
            }
            if (source.Arguments.ContainsKey(ARG_END)) {
                if (!int.TryParse(source.Arguments[ARG_END], out end)) end = 10;
            }
            if (source.Arguments.ContainsKey(ARG_STEP)) {
                if (!int.TryParse(source.Arguments[ARG_STEP], out step)) step = 1;
            }
            return new RangeSource
            {
                Start = start,
                End = end,
                Step = step
            };
        }
    }
}
