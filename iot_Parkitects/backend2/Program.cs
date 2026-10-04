using Microsoft.EntityFrameworkCore; // Added for Database
using backend2.Data; // Added for ApplicationDbContext
using backend2.Services;
using Azure.Storage.Blobs;

namespace backend2
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            //Chandra, S 2026.
            // Add services to the container.

 // DB configuration
            // This connects our app to the SQL db using the connection string in appsettings.json (Microsoft, 2026)
         
          var connectionString = Environment.GetEnvironmentVariable("SQL_CONNECTION_STRING")
          ?? builder.Configuration.GetConnectionString("DefaultConnection");

          builder.Services.AddDbContext<ApplicationDbContext>(options =>
          options.UseSqlServer(connectionString));

            // Configure Azure Blob Storage
            builder.Services.AddSingleton(sp =>
            {
                var config = sp.GetRequiredService<IConfiguration>();
                return new BlobServiceClient(config["AzureBlobStorage:ConnectionString"]);
            });

          //prints the server and database name on startup
          var csb = new Microsoft.Data.SqlClient.SqlConnectionStringBuilder(connectionString);
          Console.WriteLine($"[DB] Using {csb.DataSource} / {csb.InitialCatalog}");

            builder.Services.AddControllers();

            //(Bravo, 2021)
            builder.Services.AddHttpClient("ExpoPush", client =>
            {
                client.DefaultRequestHeaders.Add("Accept", "application/json");
              //  client.DefaultRequestHeaders.Add("Accept-Encoding", "gzip, deflate");
            });
            builder.Services.AddScoped<IExpoPushService, ExpoPushService>();

            //register the email service
            builder.Services.AddScoped<IEmailService, EmailService>();
            
            //(Jovanovic, 2022)
            //configure the background task to send rule notifications.
            builder.Services.AddHostedService<RulesAlerts>(); 

            builder.Services.AddOpenApi(); // Keeps the native engine

           

            // This allows our Expo mobile app and web app to send POST requests to this backend (Microsoft, 2026)
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAllClients", policy =>
                {
                    policy.AllowAnyOrigin()
                          .AllowAnyMethod()
                          .AllowAnyHeader();
                });
            });

            var app = builder.Build();

            if (true)
            {
                app.MapOpenApi(); // Generates /openapi/v1.json

                app.UseSwaggerUI(options =>
                {
                    // Tell Swagger UI to look at the native .NET OpenAPI endpoint
                    options.SwaggerEndpoint("/openapi/v1.json", "Parkitects v1");
                    options.RoutePrefix = "swagger";
                });
            }


            app.UseCors("AllowAllClients");


            app.UseHttpsRedirection();

            app.UseAuthorization();

            app.MapControllers();


            app.Run();
        }
    }
}

/* Reference list:

Bravo, R., 2021. expo push notifications helper.cs. (Version 10.0) [Source Code]. Available at: < https://gist.github.com/rbravo/092dda13daf769b031c70d363aaf738d > [Accessed 25 September 2026]
Jovanovic, M., 2022. Running Background Task in ASP.NET Core. (Version 10.0) [Source Code]. Available at: < https://milanjovanovic.tech/blog/running-background-tasks-in-asp-net-core > [Accessed 2 October 2026]
Microsoft, 2026. Enable Cross-Origin Requests (CORS) in ASP.NET Core. [online] Available at: <https://learn.microsoft.com/en-us/aspnet/core/security/cors> [Accessed 30 August 2026].

*/