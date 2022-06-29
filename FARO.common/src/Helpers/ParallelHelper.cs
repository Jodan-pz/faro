using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FARO.Common.Helpers {
    public static class ParallelHelper {
        public static void ForEach<TSource>(IEnumerable<TSource> source,
                                            ParallelOptions po,
                                            Action<TSource> body,
                                            Func<TSource, Exception, Exception> customException = null,
                                            int maxError = 10) {
            var exceptions = new ConcurrentQueue<Exception>();
            Parallel.ForEach(source, po, (item, pls) => ForEachBody(body, customException, maxError, item, pls, exceptions));
            if (!exceptions.IsEmpty) throw new AggregateException(exceptions);
        }

        public static void ForEach<TSource>(Partitioner<TSource> partitioner,
                                            Action<TSource> body,
                                            Func<TSource, Exception, Exception> customException = null,
                                            int maxError = 1) {
            var exceptions = new ConcurrentQueue<Exception>();
            Parallel.ForEach(partitioner, (item, pls) => ForEachBody(body, customException, maxError, item, pls, exceptions));
            if (!exceptions.IsEmpty) throw new AggregateException(exceptions);
        }

        private static void ForEachBody<TSource>(Action<TSource> body,
                                                 Func<TSource, Exception, Exception> customException,
                                                 int maxError,
                                                 TSource item,
                                                 ParallelLoopState pls,
                                                 ConcurrentQueue<Exception> exceptions) {
            try {
                body(item);
            } catch (Exception ex) {
                if (exceptions.Count < maxError) {
                    exceptions.Enqueue(customException?.Invoke(item, ex) ?? ex);
                } else {
                    pls.Stop();
                }
            }
        }
    }
}
