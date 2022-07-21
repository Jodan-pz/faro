using System;
using System.Runtime.Serialization;

namespace FARO.Common.Exceptions {

    [Serializable]
    public class FlowItemException : Exception {
        public FlowItemException() {
        }

        public FlowItemException(string message) : base(message) {
        }

        public FlowItemException(string message, Exception innerException) : base(message, innerException) {
        }

        protected FlowItemException(SerializationInfo info, StreamingContext context) : base(info, context) {
        }
    }
}
