using backend2.Data;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;

namespace backend2.Services
{
    public class ExpoPushService : IExpoPushService
    {
        //configure environment for pushing notifications
        //(Glyph, Putten and Nasstrom,2022)
        private readonly ApplicationDbContext _context;
        private readonly HttpClient _httpClient;
        private const string ExpoPushUrl = "https://exp.host/--/api/v2/push/send";

        public ExpoPushService(ApplicationDbContext context, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _httpClient = httpClientFactory.CreateClient("ExpoPush");
        }

        //method to send a notification- to put a notification in a json object
        //(Bravo, 2021)
        public async Task SendAsync(string expoPushToken, string title, string body, object? data = null)
        {
            if (string.IsNullOrEmpty(expoPushToken) ||
      !(expoPushToken.StartsWith("ExponentPushToken[") || expoPushToken.StartsWith("ExpoPushToken[")))
            {
                Console.WriteLine($"[Push] Skipping invalid token: {expoPushToken}");
                return;
            }

            //object to store the notification message to json
            var payload = new
            {
                to = expoPushToken,
                title,
                body,
                data,
                sound = "default",
                channelId = "default",   
                priority = "high"

            };//makes sure that notification pops up when app is open
            //(Glyph, Putten and Nasstrom,2022)
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
           var response = await _httpClient.PostAsync(ExpoPushUrl, content);
           var result = await response.Content.ReadAsStringAsync();
           Console.WriteLine($"[Push] {(int)response.StatusCode}: {result}"); 
        }

        //sends the message from the json object to the specific firebase user ID
        public async Task NotifyUserAsync(string userID, string title, string body, object? data = null)
        {
            //find token for specific user in the PushToken table
            var tokens = await _context.PushToken.Where(t => t.userID == userID)
                        .Select(t => t.token).ToListAsync();

            foreach (var token in tokens)
            {
                await SendAsync(token, title, body, data);
            }
        }



    }
}
/*References

Bravo, R., 2021. expo push notifications helper.cs. (Version 10.0) [Source Code]. Available at: < https://gist.github.com/rbravo/092dda13daf769b031c70d363aaf738d > [Accessed 25 September 2026]
Glyph, Putten, C., and Nasstrom, K., 2022. Expo-server-sdk-dotnet. (Version 10.0) [Source Code]. Available at: < https://github.com/glyphard/expo-server-sdk-dotnet/blob/master/src/Client/PushApiClient.cs > [Accessed 25 September 2026]


*/