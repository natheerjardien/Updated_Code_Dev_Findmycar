using System.ComponentModel.DataAnnotations;

namespace backend2.Models
{

    public class Ticket
    {
        [Key]
        public int ticketID { get; set; }

    public string? reportingUserID { get; set; }
        public string userID { get; set; }= string.Empty;

        [Required]
        public string bayID { get; set; } = string.Empty;

        [Required]
        public string bayNumber { get; set; } = string.Empty;

        [Required]
        public string sectionID { get; set; }= string.Empty;

       [Required]
        public string reason { get; set; } = string.Empty;

        public string? description { get; set; } // question mark because it is optional

        public string? imageURL { get; set; }
        public string status { get; set; } = "Pending"; //Default it will be pending


        [DataType(DataType.Date)]
        public DateTime createdAt { get; set; }

        [DataType(DataType.Date)] //This forces the data type to be a date 
        public DateTime? updatedAt { get; set; }

        public string? response { get; set; }

    }
}

