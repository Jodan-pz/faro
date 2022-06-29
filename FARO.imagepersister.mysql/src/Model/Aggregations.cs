﻿using System;
using System.Collections.Generic;

#nullable disable

namespace FARO.Services.ImagePersister.Model {
    public partial class Aggregations {
        public int Id { get; set; }
        public int IdImage { get; set; }
        public string AggregatorKey { get; set; }
        public int RowIdx { get; set; }
        public string Values { get; set; }

        public virtual Images IdImageNavigation { get; set; }
    }
}
