using System;
using System.Collections.Generic;

#nullable disable

namespace FARO.Services.ImagePersister.Model {
    public partial class Images {
        public Images() {
            Aggregations = new HashSet<Aggregations>();
            Keys = new HashSet<Keys>();
            Layers = new HashSet<Layers>();
            Rows = new HashSet<Rows>();
        }

        public int Id { get; set; }
        public string ImageKey { get; set; }
        public string ImageArgs { get; set; }

        public virtual ICollection<Aggregations> Aggregations { get; set; }
        public virtual ICollection<Keys> Keys { get; set; }
        public virtual ICollection<Layers> Layers { get; set; }
        public virtual ICollection<Rows> Rows { get; set; }
    }
}
