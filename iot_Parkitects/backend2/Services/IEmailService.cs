namespace backend2.Services
{    //(Bravo, 2021)
    public interface IEmailService
    {
        //(StackOverflow, 2023)
        Task SendTicketEmailAsync(string toEmail, string subject, string body);
    }
}

/*References

Bravo, R., 2021. expo push notifications helper.cs. (Version 10.0) [Source Code]. Available at: < https://gist.github.com/rbravo/092dda13daf769b031c70d363aaf738d > [Accessed 25 September 2026]
StackOverflow, 2023. How to send emails from web api usign azure communication service. (Version 10.0) [Source Code]. Available at: < https://stackoverflow.com/questions/76452135/how-to-send-emails-from-web-api-using-azure-communication-service > [Accessed 29 September 2026]
*/