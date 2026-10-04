using System.ComponentModel.DataAnnotations.Schema;

namespace backend2.Models
{
    [Table("SecurityPersonnel")]
    public class SecurityPersonnel : User
    {
        [Column("employeeNumber")]
        public string EmployeeNumber { get; set; } = string.Empty;

        [Column("assignedShift")]
        public string AssignedShift { get; set; } = "Day";
    }
}