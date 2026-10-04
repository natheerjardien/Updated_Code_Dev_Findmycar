using Firebase.Database;
using backend2.Data;
using backend2.Models;

namespace backend2.Services
{
    public class FirebaseSyncService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;

        private const string FirebaseUrl = "https://wil-smartparking-default-rtdb.firebaseio.com/";

        public FirebaseSyncService(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        // Executes continuously in the background when the application starts (Microsoft, 2026)
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var firebaseClient = new FirebaseClient(FirebaseUrl);

            // Subscribes to the specific Firebase path and listens for live updates (Step-Up-Labs, 2026)
            firebaseClient
                .Child("ParkingLots/Lot_A/nodes/Node_01/bays")
                .AsObservable<FirebaseBayData>()
                .Subscribe(d => 
                {
                    // Run the update logic on a separate thread to avoid blocking the Firebase listener
                    Task.Run(() => HandleBayUpdateAsync(d.Key, d.Object));
                });

            // Keeps the background service running indefinitely until the app shuts down
            await Task.Delay(Timeout.Infinite, stoppingToken);
        }

        private async Task HandleBayUpdateAsync(string bayName, FirebaseBayData bayData)
        {
            // Ignore empty updates or invalid states
            if (bayData == null) return;

            // Create a new dependency injection scope to access the Scoped DbContext (Microsoft, 2026)
            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // Find the integer bayID from SQL that matches the Firebase bay string 
            var bay = context.ParkingBays.FirstOrDefault(b => b.bayNumber == bayName);
            if (bay == null) return;

            if (bayData.status == "Occupied" && bayData.occupiedByUserId != "None" && bayData.occupiedByUserId != "Anonymous")
            {
                // Find the integer userID from SQL matching the firebaseUid
                var user = context.Users.FirstOrDefault(u => u.FirebaseUid == bayData.occupiedByUserId);
                if (user != null)
                {
                    // Check if a session already exists to prevent duplicates on minor Firebase sensor fluctuations
                    var existingSession = context.ParkingSessions
                        .FirstOrDefault(s => s.bayID == bay.bayID && s.endDate == null);

                    if (existingSession == null)
                    {
                        var newSession = new ParkingSession
                        {
                            userID = user.UserId,
                            bayID = bay.bayID,
                            startDate = DateTime.UtcNow
                        };
                        context.ParkingSessions.Add(newSession);
                        
                        // Update the live bay status in SQL
                        bay.isOccupied = true;
                        await context.SaveChangesAsync();
                    }
                }
            }
            else if (bayData.status == "Available")
            {
                // Find any open sessions for this bay and close them
                var openSession = context.ParkingSessions
                    .FirstOrDefault(s => s.bayID == bay.bayID && s.endDate == null);

                if (openSession != null)
                {
                    openSession.endDate = DateTime.UtcNow;
                    
                    // Update the live bay status in SQL
                    bay.isOccupied = false;
                    await context.SaveChangesAsync();
                }
            }
        }
    }
}
/* References
   Microsoft. 2026. Background tasks with hosted services in ASP.NET Core. [Online] Available at: <https://learn.microsoft.com/en-us/aspnet/core/fundamentals/host/hosted-services> [Accessed 1 Oct. 2026].
   Microsoft. 2026. Dependency injection in ASP.NET Core. [Online] Available at: <https://learn.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection> [Accessed 1 Oct. 2026].
   Step-Up-Labs. 2026. FirebaseDatabase.net. (Version 4.0) [Source code]. Available at: <https://github.com/step-up-labs/firebase-database-dotnet> [Accessed 1 Oct. 2026].
*/