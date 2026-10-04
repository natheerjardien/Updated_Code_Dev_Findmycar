// [Ref: 1]
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend2.Models
{
    // [Ref: 2]
    [Table("ParkingSection")]
    public class ParkingSection
    {
        [Key]
        public int sectionID { get; set; }

        [Required]
        public int parkingID { get; set; }

        [Required]
        [MaxLength(255)]
        public string sectionName { get; set; } = string.Empty;

        // [Ref: 3]
        [ForeignKey("parkingID")]
        public ParkingLot? ParkingLot { get; set; }

        public ICollection<ParkingBay> ParkingBays { get; set; } = new List<ParkingBay>();
    }
}

/*
 * References:
 * [Ref: 1] Microsoft Docs - Data Annotations in EF Core.
 * [Ref: 2] Codd, E.F. - Relational Model of Data for Large Shared Data Banks.
 * [Ref: 3] Microsoft EF Core - Relationships, Navigation Properties and Foreign Keys.
 */