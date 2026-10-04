using backend2.Data;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Azure;
using Azure.Communication.Email;

namespace backend2.Services
{
    public class EmailService : IEmailService
    {
        //(Microsoft Learn, 2025)
        //configure the email sending address (azure) & client
        private readonly EmailClient _emailClient;
        private readonly string _senderAddress;

        public EmailService(IConfiguration configuration)
        {
            var connectionString = configuration["AzureCommunicationServices:ConnectionString"];
            _senderAddress = configuration["AzureCommunicationServices:SenderAddress"];
            _emailClient = new EmailClient(connectionString);
        }

        //method to send a email
        //(Bravo, 2021)
        public async Task SendTicketEmailAsync (string toEmail, string subject, string body)
        {
            if (string.IsNullOrWhiteSpace(toEmail))
            {
                return;
            }

            try
            {
                //(StackOverflow, 2023)
                //the payload of sending the email
                var emailMessage = new EmailMessage(
                    senderAddress: _senderAddress,
                    content: new EmailContent(subject) { PlainText = body },
                    recipients: new EmailRecipients(new List<EmailAddress> { new EmailAddress(toEmail) }) //email address of user being reported
                );

                //(Microsoft Learn, 2025)
                //the ticket status will still update the email is sent in the background
                await _emailClient.SendAsync(WaitUntil.Started, emailMessage);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to send email to {toEmail}: {ex.Message}");
            }

        }
    }
}
/*References

Bravo, R., 2021. expo push notifications helper.cs. (Version 10.0) [Source Code]. Available at: < https://gist.github.com/rbravo/092dda13daf769b031c70d363aaf738d > [Accessed 25 September 2026]
Microsoft Learn, 2025. Azure Communication Email client library for .NET. (Version 10.0) [Source Code]. Available at: < https://learn.microsoft.com/en-us/dotnet/api/overview/azure/communication.email-readme?view=azure-dotnet > [Accessed 29 September 2026]
StackOverflow, 2023. How to send emails from web api usign azure communication service. (Version 10.0) [Source Code]. Available at: < https://stackoverflow.com/questions/76452135/how-to-send-emails-from-web-api-using-azure-communication-service > [Accessed 29 September 2026]
*/