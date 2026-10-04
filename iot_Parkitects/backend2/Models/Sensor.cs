using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend2.Models
{
    [Table("Sensor")]
    public class Sensor
    {
        [Key]
        public int sensorID { get; set; }

        [Required]
        public int bayID { get; set; }

        [Required]
        public int distanceReadingCm { get; set; }

        [Required]
        [MaxLength(255)]
        public string hardwareModel { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? beaconNodeKey { get; set; }

        [ForeignKey("bayID")]
        public ParkingBay? ParkingBay { get; set; }

        public string? firebaseBayKey {get; set; }
    }


}