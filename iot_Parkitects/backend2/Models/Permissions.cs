using System.ComponentModel.DataAnnotations;

namespace backend2.Models
{
    public class Permissions
    {
        [Key]
        public int permissionsID {get; set;}

        //links the permissions to the user table
        public int userID {get; set;}

        //bluetooth permission on the user's phone
        public bool bluetooth {get; set;} 

        //location permission on the user's phine
        public bool location {get; set;}
        //whether user wants to receive parking rule alerts
        public bool ruleAlerts {get; set;}

    }
}