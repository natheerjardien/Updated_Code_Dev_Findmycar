using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend2.Models;
using backend2.Data;
using backend2.Services;

namespace backend2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IExpoPushService _pushService;
        
        public NotificationController(ApplicationDbContext context, IExpoPushService pushService)
        {
            _context = context;
            _pushService = pushService;
        }

        //register the token when user logs into mobile app
        [HttpPost("register-token")]
        public async Task<IActionResult> RegisterToken([FromBody] PushTokenDTO dto)
        {
            var existing = await _context.PushToken.FirstOrDefaultAsync(t => t.userID == dto.userID &&
                        t.token == dto.token);
            
            if (existing == null)
            {
                //registering new push token details in object
                _context.PushToken.Add(new PushToken
                {
                    userID = dto.userID,
                    token = dto.token,
                    platform = dto.platform
                });
            }
            else
            {
                existing.updatedAt = DateTime.UtcNow;
            }
            await _context.SaveChangesAsync();
            return Ok();
        }

        //method to add new notifications into the notification screen
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Notifications>>> GetAll()
        {
            return await _context.Notifications.OrderByDescending(n => n.time).ToListAsync();
        }
    }
}