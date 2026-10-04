//(Microsoft, 2026)
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend2.Data;
using backend2.Models;

namespace backend2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AnalyticsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AnalyticsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/analytics/history
        [HttpGet("history")]
        public async Task<IActionResult> GetParkingHistory()
        {
            // Query the raw data from the database using primitive types (Microsoft, 2026)
            var rawHistory = await _context.ParkingSessions
                .Join(_context.Users, session => session.userID, user => user.UserId, (session, user) => new { session, user })
                .Join(_context.ParkingBays, combined => combined.session.bayID, bay => bay.bayID, (combined, bay) => new 
                {
                    BayNumber = bay.bayNumber,
                    UserName = combined.user.Name,
                    UserRole = combined.user.UserRole,
                    StartDate = combined.session.startDate,
                    EndDate = combined.session.endDate
                })
                // Order by the actual DateTime object before converting it to a string
                .OrderByDescending(h => h.StartDate) 
                .ToListAsync(); // Executes the SQL query and pulls the raw data into server memory

            // Format the data into strings
            var history = rawHistory.Select(h => new ParkingHistory
            {
                Bay = h.BayNumber,
                User = h.UserName,
                UserType = h.UserRole,
                TimeIn = h.StartDate.ToString("hh:mm tt"),
                TimeOut = h.EndDate.HasValue ? h.EndDate.Value.ToString("hh:mm tt") : "—",
                Duration = h.EndDate.HasValue ? 
                    $"{(h.EndDate.Value - h.StartDate).Hours}h {(h.EndDate.Value - h.StartDate).Minutes}m" : "Active",
                Status = h.EndDate.HasValue ? "Completed" : "Parked"
            }).ToList();

            return Ok(history);
        }

        // GET: api/analytics/summary
        [HttpGet("summary")]
        public async Task<IActionResult> GetSummaryStats()
        {
            var tickets = await _context.Tickets.ToListAsync();
            var totalTickets = tickets.Count;

            // Calculate Bar Chart Heights 
            var weeklyCounts = new int[7];

            foreach (var ticket in tickets)
            {
                // DayOfWeek starts at Sunday (0). We shift it so Monday is 0 and Sunday is 6.
                int dayIndex = ((int)ticket.createdAt.DayOfWeek + 6) % 7;
                weeklyCounts[dayIndex]++;
            }

            // Convert raw counts to percentages relative to the busiest day so the CSS bars scale correctly
            var maxDayCount = weeklyCounts.Max() == 0 ? 1 : weeklyCounts.Max();
            var weeklyChart = weeklyCounts.Select(count => (int)Math.Round((double)count / maxDayCount * 100)).ToArray();

            // Calculate the percentages for the violation chart
            int getPercentage(string reason) => totalTickets == 0 ? 0 : 
                (int)Math.Round((double)tickets.Count(t => t.reason == reason) / totalTickets * 100);

            int rpPercent = getPercentage("Restricted parking");
            int vbPercent = getPercentage("Vehicle outside bay"); 
            int ibPercent = getPercentage("Incorrect bay");
            int otherPercent = 100 - (rpPercent + vbPercent + ibPercent); // Remainder
            
            // Create a variable to hold all the summary data to be returned
            var summary = new AnalyticsSummary
            {
                TicketsIssued = tickets.Count,
                TicketsResolved = tickets.Count(t => t.status == "Resolved"),
                AvgResolutionTimeHours = tickets
                    .Where(t => t.status == "Resolved" && t.updatedAt.HasValue)
                    .Average(t => (t.updatedAt.Value - t.createdAt).TotalHours),
                WeeklyChart = weeklyChart,
                ViolationBreakdown = new Dictionary<string, int>
                {
                    { "RP", rpPercent },
                    { "VB", vbPercent },
                    { "IB", ibPercent },
                    { "OT", otherPercent < 0 ? 0 : otherPercent } // Ensures that there are no negative values
                }
            };

            return Ok(summary);
        }
    }
}

/*
Reference List: 

Microsoft. 2026. Entity Framework Core overview - EF Core | Microsoft Learn. [Online] Available at: <https://learn.microsoft.com/en-us/ef/core/> [Accessed 30 Sep. 2026].

*/