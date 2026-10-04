using backend2.Data;
using backend2.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend2.Controllers
{
    //(Noble, 2024)
    [ApiController]
    [Route("api/[controller]")]
    public class PermissionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PermissionsController(ApplicationDbContext context)
        {
            _context = context;
        }

        //GET: api/Permissions/user/{firebaseUid}, this gets the saved permissions for the user that is logged in
        [HttpGet("user/{firebaseUid}")]
        public async Task<IActionResult>GetPermissions(string firebaseUid)
        {
            //(Adeebabu, 2025)
            //find the user using their firebase uid
            var user = await _context.Users.FirstOrDefaultAsync(u => u.FirebaseUid == firebaseUid);

            //if the user does not exist 
            if(user == null)
            {
                 return NotFound("User was not found.");
            }

            //find the permissions that belong to the logged in user
            var permissions = await _context.Permissions.FirstOrDefaultAsync(p => p.userID == user.UserId);

            //a new user likey does not have any permissions saved
            if(permissions == null)
            {
                return NotFound("No permissions have been saved yet.");
            }
            return Ok(permissions);
        }

        //PUT: api/Permissions/user/{firebaseUid}
        //this creates or updates the permissions for the logged in user
        [HttpPut("user/{firebaseUid}")]
        public async Task<IActionResult> SavePermissions(string firebaseUid, [FromBody] Permissions updatedPermissions)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.FirebaseUid == firebaseUid);

            //if the user does not exit
            if(user == null)
            {
                return NotFound("User was not found.");
            }

            //checks if the user has a permissions record
            var permissions = await _context.Permissions.FirstOrDefaultAsync(p => p.userID == user.UserId);

            if(permissions == null)
            {
                //created a new permissions record
                permissions = new Permissions
                {
                    //this uses the SQL UserId, not the Firebase UID
                    userID = user.UserId,
                    bluetooth = updatedPermissions.bluetooth,
                    location = updatedPermissions.location,
                    ruleAlerts = updatedPermissions.ruleAlerts,
                };
                _context.Permissions.Add(permissions);
            }
            else
            {
                //updates the existing permissions
                permissions.bluetooth = updatedPermissions.bluetooth;
                permissions.location =updatedPermissions.location;
                permissions.ruleAlerts = updatedPermissions.ruleAlerts;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

/*
 * Reference List: 
 * Adeebabu, 2025. A comprehensive guide to C# .NET Web API: GET, POST, PUT, DELETE Methods. [online] Available at: <`https://medium.com/@adeebabu655/a-comprehensive-guide-to-c-net-web-api-get-post-put-delete-methods-40e60aff91be > [Accessed 29 September 2026]
 * Noble, A., 2024. C#, .NET Core Web API with React (TypeScript) Frontend. [online] Available at: < https://github.com/AbrahamNobleOX/React_dotNET_ASP.NETCore > [Accessed 29 September 2026]
 * 
 */