using backend2.Data;
using backend2.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Azure.Storage.Blobs;
using backend2.Services;

//Emeris School of Computer Science, 2025
namespace backend2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TicketsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IExpoPushService _pushService;//(Expo Docs, 2026)
        private readonly IEmailService _emailService;

        public TicketsController(ApplicationDbContext context, IConfiguration config, IExpoPushService pushService, IEmailService emailService)
        {
            _context = context;
            _configuration = config;
            _pushService = pushService;
            _emailService = emailService;
        }

        // GET: api/Ticket
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Ticket>>> GetAll()
        {
            return await _context.Tickets.ToListAsync();
        }

        // GET: api/Contract/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Ticket>> GetById(int id)
        {
            var ticket = await _context.Tickets.FindAsync(id);

            if (ticket == null)

                return NotFound();


            return ticket;
        }


// Turns "A01", "A-1", "a1" into "A1" to match ParkingBay.bayNumber
private static string NormalizeBay(string? raw)
{
    var m = System.Text.RegularExpressions.Regex.Match(raw ?? "", @"^\s*([A-Za-z])\s*-?\s*0*(\d+)\s*$");
    return m.Success ? $"{char.ToUpper(m.Groups[1].Value[0])}{m.Groups[2].Value}" : (raw ?? "").Trim();
}

//find uuid of whoever is parked at reported bay
private async Task<string?> FindOccupantUidAsync(string? bayNumber)
{
    var normalized = NormalizeBay(bayNumber);
    var bay = await _context.ParkingBays.FirstOrDefaultAsync(b => b.bayNumber == normalized);
    if (bay == null) return null;

    var session = await _context.ParkingSessions
        .Where(s => s.bayID == bay.bayID && s.endDate == null)
        .OrderByDescending(s => s.startDate)
        .FirstOrDefaultAsync();
    if (session == null) return null;

    var user = await _context.Users.FindAsync(session.userID);
    return user?.FirebaseUid;
}

        // POST: api/Tickets
        [HttpPost]
        public async Task<ActionResult<Ticket>> Create([FromBody] Ticket ticket)
        {
            if (string.IsNullOrEmpty(ticket.reportingUserID) && !string.IsNullOrEmpty(ticket.userID))
                ticket.reportingUserID = ticket.userID;

            //the person being reported
            var driverUid = await FindOccupantUidAsync(ticket.bayNumber);
            if (driverUid == null)
                return Conflict("There is no one parked it that bay at the moment");

                

            ticket.userID = driverUid;
            ticket.createdAt = DateTime.UtcNow;
            ticket.status = "Pending";

            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = ticket.ticketID }, ticket);
        }

        //POST: api/ Tickets/upload-image
        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            ////Emeris School of Computer Science, 2025b
            if (file == null || file.Length == 0)
                return BadRequest("No image provided");

            string connectionString = _configuration.GetConnectionString("AzureBlobStorage");
            string containerName = "complaint-image";

            BlobServiceClient blobServiceClient = new BlobServiceClient(connectionString);
            BlobContainerClient containerClient = blobServiceClient.GetBlobContainerClient(containerName);
            await containerClient.CreateIfNotExistsAsync(Azure.Storage.Blobs.Models.PublicAccessType.Blob);

            string fileName = $"{Guid.NewGuid()}_{file.FileName}";
            BlobClient blobClient = containerClient.GetBlobClient(fileName);

            using (var stream = file.OpenReadStream())
            {
                await blobClient.UploadAsync(stream, true);
            }

            return Ok(new { imageUrl = blobClient.Uri.ToString() });
        }


        //PUT: api/Tickets/5 Update
        [HttpPut("{id}")]
public async Task<IActionResult> Update(int id, [FromBody] Ticket ticket)
{
    if (id != ticket.ticketID) return BadRequest();

    var existing = await _context.Tickets.FindAsync(id);

    if (existing == null) return NotFound();

    //gets the status of the ticket for the ticket response workflow
    var previousStatus = existing.status;

    existing.status = ticket.status;
    existing.response = ticket.response;
    existing.updatedAt = DateTime.UtcNow;

    await _context.SaveChangesAsync();

    //(Expo Docs, 2026)
    //Notify user when a new ticket is issued
    if (existing.status == "Notified" && previousStatus == "Pending")
    {
        //Get the user's notification preferences
        var settings = await _context.Settings
            .FirstOrDefaultAsync(s => s.userID == existing.userID);

        //Use default values if the user has no saved settings
        bool emailNotifications = settings?.emailNotifications ?? false;
        bool pushNotifications = settings?.pushNotifications ?? true;

        //Send push notification only if enabled
        if (pushNotifications)
        {
            await _pushService.NotifyUserAsync(
                existing.userID,
                "Parking ticket issued",
                $"Ticket #{existing.ticketID} - {existing.reason}",
                new { ticketId = existing.ticketID }
            );
        }

        //Send email only if enabled
        if (emailNotifications)
        {
            //Get the user's email address
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.FirebaseUid == existing.userID);

            if (user != null)
            {
                await _emailService.SendTicketEmailAsync(
                    user.Email,
                    $"Parking Ticket Issued - #{existing.ticketID}",
                    $"A parking ticket has been issued against your vehicle.\n\n" +
                    $"Bay: {existing.bayNumber}\n" +
                    $"Reason: {existing.reason}\n\n" +
                    $"Please check the notifications sent in the Parkitech Mobile App for more details."
                );
            }
        }
    }

    //If the user does not solve the ticket properly, notify them again
    else if (existing.status == "Notified" && previousStatus == "Awaiting review")
    {
        //Get the user's notification preferences
        var settings = await _context.Settings
            .FirstOrDefaultAsync(s => s.userID == existing.userID);

        bool pushNotifications = settings?.pushNotifications ?? true;

        //Send reminder only if push notifications are enabled
        if (pushNotifications)
        {
            await _pushService.NotifyUserAsync(
                existing.userID,
                "Ticket needs to be reviewed again",
                "Security says violation has not been resolved. Please fix it properly.",
                new { ticketId = existing.ticketID }
            );
        }
    }

    return NoContent();
}

        // DELETE: api/Tickets/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var ticket = await _context.Tickets.FindAsync(id);
            if (ticket == null)
                return NotFound();


            _context.Tickets.Remove(ticket);
            await _context.SaveChangesAsync();

            return NoContent();
        }


        
    }
}
/** 
References
Emeris School of Computer Science. 2025. PROG7311 Docker part 1 - Getting started.[video online] (Version 10.0) [Source Code]. Available at: <https://youtu.be/ldfC-rTzHPY?si=znsmPz-ZSPaY-4Ii> [Accessed 5 June 2026]
Emeris School of Computer Science. 2025. PROG7311 Docker part 2- connecting between the two!. (Version 10.0) [Source Code]. Available at: <https://youtu.be/_0EhC3WauAc?si=nEazkCpBTV1YpHBp> [Accessed 5 June 2026]
Emeris School of Computer Science. 2025. PROG7311 Docker part 3- databases in docker.[video online] (Version 10.0) [Source Code]. Available at: <https://youtu.be/6tYEbngWY-E?si=10rSEEpfSNL5Kg8k> [Accessed 5 June 2026]
Emeris School of Computer Science. 2025. PROG7311 Docker part 4- connecting to database from the API.(Version 10.0) [Source Code]. Available at: <https://youtu.be/_PwpPMoeqzw?si=Q0ELlPZdN42dFU9q> [Accessed 5 June 2026]
Emeris School of Computer Science. 2025. PROG7311 Docker part 5- connecting them all together- DB -API -MVC. (Version 10.0) [Source Code]. Available at: <https://youtu.be/YlIajRMdLPk?si=D75XZKO-L6nQhR-3> [Accessed 5 June 2026]
Emeris School of Computer Science. 2025b. All about the blob storage - CLDV6211.[video online] (Version 10.0) [Source Code] . Available at:< https://www.youtube.com/watch?v=tCROBkSoi3Y&list=PL480DYS-b_kevhFsiTpPIB2RzhKPig4iK&index=9>  [Accessed 30 Aug. 2026].
Expo Docs, 2026. Expo push notifications setup. (Version 10.0) [Source Code]. Available at: < https://docs.expo.dev/push-notifications/push-notifications-setup/ > [Accessed 25 September 2026]
*/
