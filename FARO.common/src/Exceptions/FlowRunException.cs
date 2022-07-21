using System;
using System.Runtime.Serialization;

namespace FARO.Common.Exceptions {

    [Serializable]
    public class FlowRunException : Exception {
        public FlowRunException() {
        }

        public FlowRunException(string message) : base(message) {
        }

        public FlowRunException(string message, Exception innerException) : base(message, innerException) {
        }

        protected FlowRunException(SerializationInfo info, StreamingContext context) : base(info, context) {
        }
    }
}
