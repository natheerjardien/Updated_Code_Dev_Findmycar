using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend2.Models
{
    [Table("ParkingSession")]
    public class ParkingSession
    {
        [Key]
        public int sessionID { get; set; }

        [Required]
        public int userID { get; set; }

        [Required]
        public int bayID { get; set; }

        [Required]
        public DateTime startDate { get; set; }

        public DateTime? endDate { get; set; }

        [ForeignKey("userID")]
        public User? User { get; set; }

        [ForeignKey("bayID")]
        public ParkingBay? ParkingBay { get; set; }
    }
}