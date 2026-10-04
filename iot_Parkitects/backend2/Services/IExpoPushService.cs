namespace backend2.Services
{
    public interface IExpoPushService
    {
        //(Bravo, 2021)
        Task SendAsync(string expoPushToken, string title, string body, object? data = null);
        Task NotifyUserAsync(string userID, string title, string body, object? data = null);
    }
}

/*References

Bravo, R., 2021. expo push notifications helper.cs. (Version 10.0) [Source Code]. Available at: < https://gist.github.com/rbravo/092dda13daf769b031c70d363aaf738d > [Accessed 25 September 2026]

*/