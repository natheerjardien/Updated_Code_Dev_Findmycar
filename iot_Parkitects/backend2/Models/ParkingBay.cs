
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend2.Models
{
    [Table("ParkingBay")]
    public class ParkingBay
    {
        [Key]
        public int bayID { get; set; }

        [Required]
        public int sectionID { get; set; }

        [Required]
        [MaxLength(255)]
        public string bayNumber { get; set; } = string.Empty;

        [Required]
        public bool isOccupied { get; set; }

      
        [ForeignKey("sectionID")]
        public ParkingSection? ParkingSection { get; set; }

        public Sensor? Sensor { get; set; }

        public double? latitude { get; set; }
        public double? longitude { get; set; }
    }
}

