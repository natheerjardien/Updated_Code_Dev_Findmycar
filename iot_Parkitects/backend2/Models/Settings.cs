using System.ComponentModel.DataAnnotations;

namespace backend2.Models
{
    public class Settings
    {
        [Key]
        public int settingsID { get; set; } //linked to preference table with settingsID

        [Required]
        public int userID { get; set; }

        //(Noble, 2024)
        public string language { get; set; } = "English";
        public string? location { get; set; }
        public bool emailNotifications { get; set; } = false;
        public bool pushNotifications { get; set; } = true;
        
        //accessibility settings
        public string textSize { get; set; } = "medium";
        public string theme { get; set; } = "default";
        public bool reduceMotion { get; set; } = false;
        public bool screenReader { get; set; } = true;
        public bool hapticFeedback { get; set; } = true;



    }
}

/*
 * References
 * 
 * Noble, A., 2024. C#, .NET Core Web API with React (TypeScript) Frontend. [online]Available at: < https://github.com/AbrahamNobleOX/React_dotNET_ASP.NETCore > [Accessed 30 August 2026]
 * 
 */