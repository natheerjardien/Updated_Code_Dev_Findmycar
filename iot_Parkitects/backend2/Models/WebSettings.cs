using System.ComponentModel.DataAnnotations;

namespace backend2.Models
{
    public class WebSettings
    {
        [Key]
        public int settingsID { get; set; } //linked to preference table with settingsID
        [Required]
        public string userID { get; set; } = string.Empty;

        //Security web app settings
        public bool darkMode {get; set;} = false;
        public bool compactTables {get; set;} = false;
        public bool ticketUpdates {get; set;} = true;
        public bool parkingAlerts {get; set;} = true;
        public bool systemAlerts {get; set;} = true;
        public bool largerText {get; set;} = false;
        public bool reducedMotion {get; set;} = false;
        public bool alertSound {get; set;} = true;
        public bool rememberDevice {get; set;} = false;
    }
}