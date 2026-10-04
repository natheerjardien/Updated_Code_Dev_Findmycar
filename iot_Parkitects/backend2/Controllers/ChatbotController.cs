using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend2.Models;
using backend2.Data;

namespace backend2.Controllers
{
    // Route the API to "api/ChatBotController" (Microsoft, 2026)
    [Route("api/[controller]")]
    [ApiController]
    public class ChatBotController : Controller
    {
        
        private ApplicationDbContext _context;
        
        // Set the applicationDbContext when the controller is called
        public ChatBotController(ApplicationDbContext context)
        {
            _context = context;
        }
    }
}

/*
Reference List:

Microsoft, 2026. Create web APIs with ASP.NET Core. [online] Available at: <https://learn.microsoft.com/en-us/aspnet/core/web-api/?view=aspnetcore-10.0> [Accessed 29 August 2026].

*/