using System.ComponentModel.DataAnnotations.Schema;

namespace backend2.Models
{
    [Table("Lecturer")]
    public class Lecturer : User
    {
        [Column("staffNumber")]
        public string StaffNumber { get; set; } = string.Empty;

        [Column("facultyDepartment")]
        public string FacultyDepartment { get; set; } = "General";
    }
}