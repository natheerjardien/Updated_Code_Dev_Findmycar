using System.ComponentModel.DataAnnotations;

namespace backend2.Models
{
    public class Rating
    {
        [Key]
        public int ratingID { get; set; }

        [Required]
        public string userID { get; set; } = string.Empty;

        //(Noble, 2024)
        public string label { get; set; } = string.Empty; //terrible - great
        public int value { get; set; } //0-4
        public DateTime submittedAt { get; set; } = DateTime.UtcNow;

    }
}

/*
 * References
 * 
 * Noble, A., 2024. C#, .NET Core Web API with React (TypeScript) Frontend. [online]Available at: < https://github.com/AbrahamNobleOX/React_dotNET_ASP.NETCore > [Accessed 30 August 2026]
 * 
 */