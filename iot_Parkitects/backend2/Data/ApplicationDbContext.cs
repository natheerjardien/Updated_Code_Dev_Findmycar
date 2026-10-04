using Microsoft.EntityFrameworkCore;
using backend2.Models;

namespace backend2.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }
     // Tells Entity Framework to create tables related to the application models (Microsoft, 2026)
       // // public DbSet<Analytics> Analytics { get; set; }
      //  // public DbSet<Chatbot> Chatbot { get; set; }
       // // public DbSet<FindMyCar> FindMyCar { get; set; }
      //  // public DbSet<Notifications> Notifications { get; set; }
      //  // public DbSet<Parking> Parking { get; set; }
        public DbSet<Settings> Preferences { get; set; }
        public DbSet<Ticket> Tickets { get; set; }

        public DbSet<User> Users { get; set; }
        public DbSet<Rating> Rating { get; set; }
        public DbSet<Student> Students { get; set; }
        public DbSet<Lecturer> Lecturers { get; set; }
        public DbSet<SecurityPersonnel> SecurityPersonnel { get; set; }
        public DbSet<PushToken> PushToken { get; set; }
        public DbSet<Notifications> Notifications { get; set; }

       public DbSet<ParkingLot> ParkingLots { get; set; }
        public DbSet<ParkingSection> ParkingSections { get; set; }
        public DbSet<ParkingBay> ParkingBays { get; set; }
        public DbSet<Sensor> Sensors { get; set; }   
         public DbSet<Permissions> Permissions {get; set;}

  public DbSet<ParkingSession> ParkingSessions { get; set; }

        public DbSet<WebSettings> WebSettings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

// Configure parking relationships for the Map
            modelBuilder.Entity<ParkingSection>()
                .HasOne(ps => ps.ParkingLot)
                .WithMany(pl => pl.ParkingSections)
                .HasForeignKey(ps => ps.parkingID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ParkingBay>()
                .HasOne(pb => pb.ParkingSection)
                .WithMany(ps => ps.ParkingBays)
                .HasForeignKey(pb => pb.sectionID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Sensor>()
                .HasOne(s => s.ParkingBay)
                .WithOne(pb => pb.Sensor)
                .HasForeignKey<Sensor>(s => s.bayID)
                .OnDelete(DeleteBehavior.Cascade);


            
            // Forces EF Core to map inheritance to separate tables linked by primary keys (Microsoft, 2026)
            modelBuilder.Entity<User>().UseTptMappingStrategy();
            modelBuilder.Entity<Settings>().ToTable("Preferences");
            modelBuilder.Entity<WebSettings>().ToTable("Settings");
        }
    }
}

/*
Reference List:

Microsoft, 2026. Entity Framework Core. [online] Available at: <https://learn.microsoft.com/en-us/ef/core/> [Accessed 30 August 2026].

*/
