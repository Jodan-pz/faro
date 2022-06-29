using Microsoft.EntityFrameworkCore;

#nullable disable

namespace FARO.Services.ImagePersister.Model {
    public partial class ImagePersisterDbContext : DbContext {
        public ImagePersisterDbContext() {
        }

        public ImagePersisterDbContext(DbContextOptions<ImagePersisterDbContext> options)
            : base(options) {
        }

        public virtual DbSet<Aggregations> Aggregations { get; set; }
        public virtual DbSet<Images> Images { get; set; }
        public virtual DbSet<Keys> Keys { get; set; }
        public virtual DbSet<Layers> Layers { get; set; }
        public virtual DbSet<Rows> Rows { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder) {
            modelBuilder.HasCharSet("utf8mb4")
                .UseCollation("utf8mb4_general_ci");

            modelBuilder.Entity<Aggregations>(entity => {
                entity.HasIndex(e => e.IdImage, "Aggregations_FK");

                entity.Property(e => e.Id).HasColumnType("int(11)");

                entity.Property(e => e.IdImage).HasColumnType("int(11)");

                entity.Property(e => e.RowIdx).HasColumnType("int(11)");

                entity.Property(e => e.Values).HasColumnType("text");

                entity.HasOne(d => d.IdImageNavigation)
                    .WithMany(p => p.Aggregations)
                    .HasForeignKey(d => d.IdImage)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("Aggregations_FK");
            });

            modelBuilder.Entity<Images>(entity => {
                entity.Property(e => e.Id).HasColumnType("int(11)");

                entity.Property(e => e.ImageArgs).HasColumnType("text");

                entity.Property(e => e.ImageKey)
                    .IsRequired()
                    .HasMaxLength(100);
            });

            modelBuilder.Entity<Keys>(entity => {
                entity.HasIndex(e => e.IdImage, "Keys_FK");

                entity.Property(e => e.Id).HasColumnType("int(11)");

                entity.Property(e => e.IdImage).HasColumnType("int(11)");

                entity.Property(e => e.RowIdx).HasColumnType("int(11)");

                entity.Property(e => e.Values).HasColumnType("text");

                entity.HasOne(d => d.IdImageNavigation)
                    .WithMany(p => p.Keys)
                    .HasForeignKey(d => d.IdImage)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("Keys_FK");
            });

            modelBuilder.Entity<Layers>(entity => {
                entity.HasIndex(e => e.IdImage, "Layers_FK");

                entity.Property(e => e.Id).HasColumnType("int(11)");

                entity.Property(e => e.IdImage).HasColumnType("int(11)");

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.RowIdx).HasColumnType("int(11)");

                entity.Property(e => e.Values).HasColumnType("text");

                entity.HasOne(d => d.IdImageNavigation)
                    .WithMany(p => p.Layers)
                    .HasForeignKey(d => d.IdImage)
                    .HasConstraintName("Layers_FK");
            });

            modelBuilder.Entity<Rows>(entity => {
                entity.HasIndex(e => e.IdImage, "Rows_FK");

                entity.Property(e => e.Id).HasColumnType("int(11)");

                entity.Property(e => e.IdImage).HasColumnType("int(11)");

                entity.Property(e => e.RowIdx).HasColumnType("int(11)");

                entity.Property(e => e.Values).HasColumnType("text");

                entity.HasOne(d => d.IdImageNavigation)
                    .WithMany(p => p.Rows)
                    .HasForeignKey(d => d.IdImage)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("Rows_FK");
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
