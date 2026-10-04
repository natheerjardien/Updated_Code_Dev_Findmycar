using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend2.Data;
using backend2.Models;
using System.Threading.Tasks;

namespace backend2.Controllers
{
    // Sets up the API routing (Microsoft, 2026a)
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserController(ApplicationDbContext context)
        {
            _context = context;
        }

        // A Data Transfer Object to safely receive the incoming JSON (Microsoft, 2026a)
        public class UserSyncDto
        {
            public string FirebaseUid { get; set; } = string.Empty;
            public string UserNumber { get; set; } = string.Empty;
            public string Name { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string UserRole { get; set; } = "Student";
        }

        public class UpdateProfileDto
        {
            public string Name { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
        }

        [HttpPost("sync")]
        public async Task<IActionResult> SyncUser([FromBody] UserSyncDto dto)
        {
            if (string.IsNullOrEmpty(dto.FirebaseUid)) 
                return BadRequest("Firebase UID is required.");

            // Checks if this user already synced to avoid duplicates using Entity Framework (Microsoft, 2026b)
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.FirebaseUid == dto.FirebaseUid);
            
            if (existingUser != null)
            {
                return Ok(new { message = "User already exists", user = existingUser });
            }

            // Maps to the specific table based on the frontend selection
            if (dto.UserRole == "Student")
            {
                var newStudent = new Student
                {
                    FirebaseUid = dto.FirebaseUid,
                    UserNumber = dto.UserNumber,
                    Name = dto.Name,
                    Email = dto.Email,
                    UserRole = dto.UserRole,
                    StudentNumber = dto.UserNumber
                };
                _context.Students.Add(newStudent);
            }
            else if (dto.UserRole == "Lecturer")
            {
                var newLecturer = new Lecturer
                {
                    FirebaseUid = dto.FirebaseUid,
                    UserNumber = dto.UserNumber,
                    Name = dto.Name,
                    Email = dto.Email,
                    UserRole = dto.UserRole,
                    StaffNumber = dto.UserNumber
                };
                _context.Lecturers.Add(newLecturer);
            }
            else
            {
                var newUser = new User
                {
                    FirebaseUid = dto.FirebaseUid,
                    UserNumber = dto.UserNumber,
                    Name = dto.Name,
                    Email = dto.Email,
                    UserRole = dto.UserRole
                };
                _context.Users.Add(newUser);
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "User synced successfully" });
        }

        [HttpGet("resolve-email/{userNumber}")]
        public async Task<IActionResult> GetEmailFromUserNumber(string userNumber)
        {
            // Queries the db to allow login with their student/staff number (Microsoft, 2026b)
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserNumber == userNumber);
            if (user == null) return NotFound("User not found");

            return Ok(new { email = user.Email, role = user.UserRole });
        }

        [HttpGet("profile/{firebaseUid}")]
        public async Task<IActionResult> GetUserProfile(string firebaseUid)
        {
            // First checks the Student table for the logged-in Firebase user
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.FirebaseUid == firebaseUid);

            if (student != null)
            {
                return Ok(new
                {
                    userNumber = student.UserNumber,
                    name = student.Name,
                    email = student.Email,
                    userRole = student.UserRole
                });
            }

            // Checks the Lecturer table if the user is not a student
            var lecturer = await _context.Lecturers
                .FirstOrDefaultAsync(l => l.FirebaseUid == firebaseUid);

            if (lecturer != null)
            {
                return Ok(new
                {
                    userNumber = lecturer.UserNumber,
                    name = lecturer.Name,
                    email = lecturer.Email,
                    userRole = lecturer.UserRole
                });
            }

            // Finally checks the base User table
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.FirebaseUid == firebaseUid);

            if (user != null)
            {
                return Ok(new
                {
                    userNumber = user.UserNumber,
                    name = user.Name,
                    email = user.Email,
                    userRole = user.UserRole
                });
            }

            return NotFound("User profile not found.");
        }

        [HttpPut("profile/{firebaseUid}")]
        public async Task<IActionResult> UpdateUserProfile(
            string firebaseUid,
            [FromBody] UpdateProfileDto dto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.FirebaseUid == firebaseUid);

            if (user == null)
            {
                return NotFound("User profile not found.");
            }

            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest("Name is required.");
            }

            if (string.IsNullOrWhiteSpace(dto.Email))
            {
                return BadRequest("Email is required.");
            }

            user.Name = dto.Name;
            user.Email = dto.Email;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Profile updated successfully.",
                userNumber = user.UserNumber,
                name = user.Name,
                email = user.Email,
                userRole = user.UserRole
            });
        }
    }
}

/* Reference list:

   Microsoft, 2026a. Create web APIs with ASP.NET Core. [online] Available at: <https://learn.microsoft.com/en-us/aspnet/core/web-api/?view=aspnetcore-10.0> [Accessed 30 August 2026].
   
   Microsoft, 2026b. Entity Framework Core. [online] Available at: <https://learn.microsoft.com/en-us/ef/core/> [Accessed 30 August 2026].

*/