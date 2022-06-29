using System;
using System.Collections.Generic;
using System.Linq;

namespace FARO.WebApi.Filters {

    public interface IWrappedServiceResult { /* mark interface */}
    public record WrappedServiceResultError(int Code, string Message);

    public class WrappedServiceResult<T> : IWrappedServiceResult {
        private readonly T _result;
        private readonly List<Exception> _errors = new();

        public WrappedServiceResult() {
        }

        public WrappedServiceResult(T result) {
            _result = result;
        }

        public T Result => _result;

        public void AddError(Exception ex) => _errors.Add(ex);

        public bool Status => !_errors.Any();

        public IEnumerable<WrappedServiceResultError> Errors => _errors.Select(e => new WrappedServiceResultError(0, e.Message));

        public bool IsWrappedResult => true;
    }
}