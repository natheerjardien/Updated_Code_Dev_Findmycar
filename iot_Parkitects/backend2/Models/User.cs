using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend2.Models
{
    [Table("User")]
    public class User
    {
        [Key]
        // DataAnnotations to define the primary key and column names (Microsoft, 2026a)
        [Column("userID")]
        public int UserId { get; set; }
        
        [Required]
        public string FirebaseUid { get; set; } = string.Empty; // This links our SQL DB to Firebase (Microsoft, 2026b)

        [Required]
        [Column("userNumber")]
        public string UserNumber { get; set; } = string.Empty;
        
        [Required]
        [Column("name")]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [Column("userRole")]
        public string UserRole { get; set; } = "Student";

        [Column("isParked")]
        public bool IsParked { get; set; } = false;
        
        [Column("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

/*
Reference List:

Microsoft, 2026a. DataAnnotations Namespace. [online] Available at: <https://learn.microsoft.com/en-us/dotnet/api/system.componentmodel.dataannotations> [Accessed 30 August 2026].

Microsoft, 2026b. Entity Framework Core. [online] Available at: <https://learn.microsoft.com/en-us/ef/core/> [Accessed 30 August 2026].

*/