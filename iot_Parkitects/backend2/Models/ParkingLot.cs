// [Ref: 1]
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend2.Models
{
    // [Ref: 2]
    [Table("ParkingLot")]
    public class ParkingLot
    {
        [Key]
        public int parkingID { get; set; }

        [Required]
        [MaxLength(255)]
        public string lotName { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string campusLocation { get; set; } = string.Empty;

        [Required]
        public int totalCapacity { get; set; }

        // [Ref: 3] Navigation Property
        public ICollection<ParkingSection> ParkingSections { get; set; } = new List<ParkingSection>();
    }
}

/*
 * References:
 * [Ref: 1] Microsoft Docs - System.ComponentModel.DataAnnotations Namespace.
 * [Ref: 2] Microsoft Docs - Entity Framework Core Relational Table Attribute Mapping.
 * [Ref: 3] Martin Fowler - Patterns of Enterprise Application Architecture (Navigation Properties).
 */