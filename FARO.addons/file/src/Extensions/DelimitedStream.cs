using System.Text;

namespace FARO.Addons.File.Extensions {
    public static class DelimitedStream {
        public static IEnumerable<IList<string>> DelimitedBy(this TextReader csv, char delim, bool ignoreFirstLine) {
            if (ignoreFirstLine) csv.ReadLine();
            var result = new List<string>();
            var curValue = new StringBuilder();
            var c = (char)csv.Read();

            while (csv.Peek() != -1) {
                if (c == delim) {
                    result.Add(string.Empty);
                    c = (char)csv.Read();
                    continue;
                }
                switch (c) {
                    case '"': //qualified text
                    case '\'':
                        var q = c;
                        c = (char)csv.Read();
                        var inQuotes = true;
                        while (inQuotes && csv.Peek() != -1) {
                            if (c == q) {
                                c = (char)csv.Read();
                                if (c != q)
                                    inQuotes = false;
                            }

                            if (inQuotes) {
                                curValue.Append(c);
                                c = (char)csv.Read();
                            }
                        }
                        result.Add(curValue.ToString());
                        curValue = new StringBuilder();
                        if (c == delim) c = (char)csv.Read(); // either delim, newline, or endofstream
                        break;
                    case '\n': //end of the record
                    case '\r':
                        //potential bug here depending on what your line breaks look like
                        if (result.Count > 0) // don't return empty records
                        {
                            yield return result;
                            result = new List<string>();
                        }
                        c = (char)csv.Read();
                        break;
                    default: //normal unqualified text
                        while (c != delim && c != '\r' && c != '\n') {
                            curValue.Append(c);
                            if (csv.Peek() != -1)
                                c = (char)csv.Read();
                            else
                                break;
                        }
                        result.Add(curValue.ToString());
                        curValue = new StringBuilder();
                        if (c == delim) c = (char)csv.Read(); //either delim, newline, or endofstream
                        break;
                }
            }
            if (curValue.Length > 0) //potential bug: I don't want to skip on a empty column in the last record if a caller really expects it to be there
                result.Add(curValue.ToString());
            if (result.Count > 0)
                yield return result;

        }
    }
}
