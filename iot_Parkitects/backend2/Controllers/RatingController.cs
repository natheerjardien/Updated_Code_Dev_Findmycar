using Microsoft.AspNetCore;
using backend2.Data;
using backend2.Models;
using Microsoft.AspNetCore.Mvc;


namespace backend2.Controllers
{
    //(Noble, 2024)
    [ApiController] //attribute tells ASP NET Core that this class is an API controller 
    [Route("api/[controller]")]
    public class RatingController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RatingController(ApplicationDbContext context)
        {
            _context = context;
        }

        //Gets users saved preferences in settings
        [HttpPost]
        public async Task<ActionResult<Rating>> SubmitRating([FromBody] Rating rating)
        {
            rating.submittedAt = DateTime.UtcNow; //time is automatically fetched when rating is submitted
            _context.Rating.Add(rating); //adds rating to DB
            await _context.SaveChangesAsync();

            //(Christy, 2025)
            //CreatedAtAction = 201 Created
            return CreatedAtAction(nameof(SubmitRating), new { id = rating.ratingID }, rating); //returns the created rating with its ID
        }
    }
}
/*
 * References
 * 
 * Christy, N., 2025. CreatedAtAction vs OK(): The right way to return a created resource. [online] Available at: < https://medium.com/@nirmalichristy/createdataction-vs-ok-the-right-way-to-return-a-created-resource-cf0f5a55f069 > [Accessed 30 August 2026]
 * Noble, A., 2024. C#, .NET Core Web API with React (TypeScript) Frontend. [online] Available at: < https://github.com/AbrahamNobleOX/React_dotNET_ASP.NETCore > [Accessed 30 August 2026]
 * 
 */