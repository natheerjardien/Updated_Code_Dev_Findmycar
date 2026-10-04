using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace backend2.Models
{
    public class PushToken
    {
        [Key]
        public int tokenID {get; set;}
        public string userID {get; set;} = string.Empty;
        public string token {get; set;} = string.Empty;
        public string platform {get; set;} = string.Empty;
        public DateTime createdAt {get; set;} = DateTime.UtcNow;
        public DateTime? updatedAt {get; set;}       

    }
}