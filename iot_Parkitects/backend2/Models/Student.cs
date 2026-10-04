using System.ComponentModel.DataAnnotations.Schema;

namespace backend2.Models
{
    [Table("Student")]
    // Inherits from the base User class for EF TPT mapping (Microsoft, 2026)
    public class Student : User
    {
        [Column("studentNumber")]
        public string StudentNumber { get; set; } = string.Empty;

        [Column("yearOfStudy")]
        public int YearOfStudy { get; set; } = 1;
    }
}

/*
Reference List:

Microsoft, 2026. Entity Framework Core. [online] Available at: <https://learn.microsoft.com/en-us/ef/core/> [Accessed 30 August 2026].

*/