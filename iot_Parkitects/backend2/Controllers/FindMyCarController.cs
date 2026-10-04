// (Microsoft, 2026a; Microsoft, 2026b)
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend2.Data;
using backend2.Models;
using System.Linq;
using System.Threading.Tasks;

namespace backend2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FindMyCarController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public FindMyCarController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/FindMyCar/active-bay
        [HttpGet("active-bay")]
        public async Task<IActionResult> GetActivePrototypeBay()
        {
            // Queries the DB to find a bay that the ESP32 currently reads as occupied (Microsoft, 2026b)
            var occupiedBay = await _context.ParkingBays
                .Where(b => b.isOccupied == true && b.latitude != null && b.longitude != null)
                .FirstOrDefaultAsync();

            // If the physical sensor currently sees nothing, it return a 404 error
            if (occupiedBay == null)
            {
                return NotFound(new { message = "No car is currently detected in the prototype bays." });
            }

            // Returns the GPS coordinates and bay number to the mobile app (Microsoft, 2026a)
            return Ok(new 
            { 
                bayId = occupiedBay.bayID,
                bayNumber = occupiedBay.bayNumber,
                latitude = occupiedBay.latitude,
                longitude = occupiedBay.longitude,
                formattedLocation = $"Bay {occupiedBay.bayNumber}"
            });
        }
    }
}

/*
 * REFERENCES:
 * Microsoft, 2026a. ControllerBase Class. [Online] Available at: <https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.controllerbase> [Accessed 26 September 2026].
 * Microsoft, 2026b. EF Core Querying Data. [Online] Available at: <https://learn.microsoft.com/en-us/ef/core/querying/> [Accessed 26 September 2026].
 */