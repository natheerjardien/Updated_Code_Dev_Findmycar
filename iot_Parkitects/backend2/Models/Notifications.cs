using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace backend2.Models
{
    public class Notifications
    {
        [Key]
        public int notificationID {get; set;}
        public string notificationType {get; set;} = string.Empty;
        public string title {get; set;} = string.Empty;
        public string description {get; set;} = string.Empty;
        public DateTime time {get; set;}        
    }
}