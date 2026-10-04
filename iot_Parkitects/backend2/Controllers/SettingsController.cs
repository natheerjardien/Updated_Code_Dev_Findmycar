using Microsoft.AspNetCore;
using backend2.Data;
using backend2.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend2.Controllers
{
    //(Noble, 2024)
    [ApiController] //attribute tells ASP NET Core that this class is an API controller 
    [Route("api/[controller]")]
    public class SettingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SettingsController(ApplicationDbContext context)
        {
            _context = context;
        }

        //Mobile app settings

        //Gets users saved preferences in settings
        [HttpGet("user/{firebaseUid}")]
        public async Task<ActionResult<Settings>> GetAllSettings(string firebaseUid)
        {
            var user = await _context.Users.FirstOrDefaultAsync(s => s.FirebaseUid == firebaseUid);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            // Queries Preferences using the integer ID
            var settings = await _context.Preferences.FirstOrDefaultAsync(s => s.userID == user.UserId);
            
            if (settings == null)
            {
                return Ok(new Settings { userID = user.UserId }); //sets preferences to default values
            }
            return Ok(settings);
        }

        //Updates user preferences in settings
        [HttpPut("user/{firebaseUid}")]
        public async Task<ActionResult<Settings>> UpdateSettings(string firebaseUid, Settings settings)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.FirebaseUid == firebaseUid);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            //(Adeebabu, 2025)
            var preferences = await _context.Preferences.FirstOrDefaultAsync(s => s.userID == user.UserId);

            if (preferences == null) //default settings for new users
            {
                
                settings.userID = user.UserId;
                _context.Preferences.Add(settings);
                await _context.SaveChangesAsync(); //changes are saved to the DB
                return Ok(settings);
            }
                       
            //updated is user changes their preferences in settings
            preferences.language = settings.language;
            preferences.location = settings.location;
            preferences.emailNotifications = settings.emailNotifications;
            preferences.pushNotifications = settings.pushNotifications;
            preferences.textSize = settings.textSize;
            preferences.theme = settings.theme;
            preferences.reduceMotion = settings.reduceMotion;
            preferences.screenReader = settings.screenReader;
            preferences.hapticFeedback = settings.hapticFeedback;

            await _context.SaveChangesAsync(); //changes are saved to the DB
            return Ok(preferences);
        }

            //Web app settings  
            //gets the user's web settigngs
            [HttpGet("web/{firebaseUid}")]
            public async Task<ActionResult<WebSettings>> GetWebSettings(string firebaseUid)
            {
                var settings = await _context.WebSettings.FirstOrDefaultAsync(s => s.userID == firebaseUid);

                if(settings == null)
                {
                    //returns default web settings for new users
                    return Ok(new WebSettings { userID = firebaseUid });
                }
                return Ok(settings);
            }

            //updates user's settings
            [HttpPut("web/{firebaseUid}")]
            public async Task<ActionResult<WebSettings>> UpdateWebSettings(string firebaseUid, WebSettings settings)
            {
                //(Adeebabu, 2025)
                var existingSettings = await _context.WebSettings.FirstOrDefaultAsync(s => s.userID == firebaseUid);
                
                if(existingSettings == null)
                {
                    //creates new web settings for new users
                    settings.settingsID = 0; 
                    settings.userID = firebaseUid;
                    _context.WebSettings.Add(settings);
                    await _context.SaveChangesAsync(); //changes are saved to the DB
                    return Ok(settings);
                }

            //Web security settings
            existingSettings.darkMode = settings.darkMode;
            existingSettings.compactTables = settings.compactTables;
            existingSettings.ticketUpdates = settings.ticketUpdates;
            existingSettings.parkingAlerts = settings.parkingAlerts;
            existingSettings.systemAlerts = settings.systemAlerts;
            existingSettings.alertSound = settings.alertSound;
            existingSettings.rememberDevice = settings.rememberDevice;
            existingSettings.largerText = settings.largerText;
            existingSettings.reducedMotion = settings.reducedMotion;

            await _context.SaveChangesAsync(); //changes are saved to the DB
            return Ok(existingSettings);
            }
        }
    }

/*
 * References
 * 
 * Adeebabu, 2025. A comprehensive guide to C# .NET Web API: GET, POST, PUT, DELETE Methods. [online] Available at: <`https://medium.com/@adeebabu655/a-comprehensive-guide-to-c-net-web-api-get-post-put-delete-methods-40e60aff91be > [Accessed 30 August 2026]
 * Noble, A., 2024. C#, .NET Core Web API with React (TypeScript) Frontend. [online] Available at: < https://github.com/AbrahamNobleOX/React_dotNET_ASP.NETCore > [Accessed 30 August 2026]
 * 
 */