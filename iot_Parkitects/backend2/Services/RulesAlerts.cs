using backend2.Data;
using Microsoft.EntityFrameworkCore;

namespace backend2.Services
{
    //Background service that runs in the backgroudn to push road rules at 12:00 to all users that have it tuned on in permissions
    //(Jovanovic, 2024)
    public class RulesAlerts : BackgroundService
    {
        private readonly IServiceProvider  _serviceProvider;

        //rules are stored in array to be fetched
        //(StackOverflow, 2010)
        private static readonly string[] ParkingRules = new[] //a few parkign rules related to parking and national roads
        {
            "Park you vehicle only in designated and clearly marked parking bays.",
            "Drive 20km/h in the parking lot",
            "Do not park in staff, pick and drop, or disability bays without valid reasoning.",
            "Do not park in the pick and drop zone for more than 10 minutes.",
            "Any parking issues should be reported to campus security or log a ticket in the app.",
            "Do not drive in the opposite direction of the road sign arrows.",
            "Do not make noise with car speakers in the parking lot",
            "Make sure that your vehicle lights are turned off.",
            "Do not park across two bays.",
            "Report a damaged sensor to security immediately.",
            "Give way to pedestrians",
            "Speed kills but patience preserves",
            "Pay attention to the road signs",
            "Remember to lock your vehicle",
            "Remember to keep left and pass right on the road",
            "Keep a safe distance between your car and the car in front of you",
            "Ensure that your vehicle is roadworthy",
            "Avoid using your cellphones while driving",
            "Obey the speed limit",
            "Rather stop driving when you are tired to avoid the risk of accidents",
            "Don't drink and drive",
            "Check your tyres regurlarly",
            "Respect other drivers"
        };

        public RulesAlerts(IServiceProvider  serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        //(Castro, 2022)
        //while loop repeats and delays until the next day at 12 
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                var delay = GetDelayUntilNextSendTime();
                await Task.Delay(delay, stoppingToken);

                if (stoppingToken.IsCancellationRequested) break;

                await SendDailyRuleAsync();
            }
        }

        //(Dotnet Perls, 2026)
        //time of day the notification gets sent at 12
        private static readonly TimeSpan SendTime = new TimeSpan(12, 0, 0);

        //(Adediran, 2025)
        //works out how long to wait until the next 12:00pm Send Time
        private static TimeSpan GetDelayUntilNextSendTime()
        {
            var now = DateTime.Now;
            var todaysSendTime = now.Date + SendTime;
            //(StackOverflow, 2021)
            //if today's time has already passed, target tomorrow instead
            var nextSendTime = now <= todaysSendTime ? todaysSendTime : todaysSendTime.AddDays(1);

            return nextSendTime - now; //delays until tomorrow again 
        }

        private async Task SendDailyRuleAsync()
        {
            //(Code Maze, 2024)
            using var scope = _serviceProvider.CreateScope(); //scope is created everytime the user needs to get a notification
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>(); //gets the database through ApplicationDbContext
            var pushService = scope.ServiceProvider.GetRequiredService<IExpoPushService>(); //push service is called to push to notification bar

            //cycles through the rules array based on day of year divided by the number of rules in the array, so it loops based on that formula
            var ruleIndex = DateTime.Now.DayOfYear % ParkingRules.Length; //(StackOverflow, 2018)
            var todaysRule = ParkingRules[ruleIndex];

            //only notify users who have ruleAlerts switched on: set to true
            var firebaseUids = await context.Permissions
                .Where(p => p.ruleAlerts)
                .Join(context.Users, p => p.userID, u => u.UserId, (p, u) => u.FirebaseUid)
                .ToListAsync();

            foreach (var firebaseUid in firebaseUids)
            {
                //notifys the user in notification bar
                await pushService.NotifyUserAsync(
                    firebaseUid,
                    "Rule of the Day",
                    todaysRule,
                    new { type = "ruleAlert" }
                );
            }
        }
    }
}
/*References

Adediran, F., 2025. The efficient way to measure time in .NET. (Version 10.0) [Source Code]. Available at: < https://dev.to/francis04j/the-efficient-way-to-measure-time-in-net-1i1k > [Accessed 2 October 2026]
Castro, S., 2022. Getting started with background tasks in ASP.NET Core WebAPI. (Version 10.0) [Source Code]. Available at: < https://www.jobsity.com/blog/getting-started-with-background-tasks-in-asp.net-core-webapi > [Accessed 2 October 2026]
Code Maze, 2024. Different Ways to run background tasks in ASP.NET Core. (Version 10.0) [Source Code]. Available at: < https://code-maze.com/aspnetcore-different-ways-to-run-background-tasks/ > [Accessed 2 October 2026]
Dotnet Perls, 2026. TimeSpan Examples. (Version 10.0) [Source Code]. Available at: < https://www.dotnetperls.com/timespan > [Accessed 2 October 2026]
Jovanovic, M., 2022. Running Background Task in ASP.NET Core. (Version 10.0) [Source Code]. Available at: < https://milanjovanovic.tech/blog/running-background-tasks-in-asp-net-core > [Accessed 2 October 2026]
StackOverflow, 2021. Best way to create a "run once" time delayed function in C#. (Version 10.0) [Source Code]. Available at: < https://stackoverflow.com/questions/5904636/best-way-to-create-a-run-once-time-delayed-function-in-c-sharp > [Accessed 2 October 2026]
StackOverlfow, 2018. Hpw can I find the day of the year, year, month and day for noe in C#? [duplicate]. (Version 10.0) [Source Code]. Available at: < https://stackoverflow.com/questions/46685859/how-can-i-find-the-day-of-the-year-year-month-and-day-for-now-in-c > [Accessed 2 October 2026]
StackOverflow, 2010. Static readonly string arrays. (Version 10.0) [Source Code]. Available at: < https://stackoverflow.com/questions/2395274/static-readonly-string-arrays > [Accessed 2 October 2026]

*/
