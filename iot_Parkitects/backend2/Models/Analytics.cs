namespace backend2.Models
{
    // Formats the response for the frontend insight cards
    public class AnalyticsSummary
    {
        // Fields for the ticket summary
        public int TicketsIssued { get; set; }
        public int TicketsResolved { get; set; }
        public double AvgResolutionTimeHours { get; set; }

        // Fields for the violation breakdown and charts
        public int[] WeeklyChart { get; set; } 
        public Dictionary<string, int> ViolationBreakdown { get; set; }
    }

    // Formats the response for the parking history table
    public class ParkingHistory
    {
        public string? Bay { get; set; }
        public string? User { get; set; }
        public string? UserType { get; set; }
        public string? TimeIn { get; set; }
        public string? TimeOut { get; set; }
        public string? Duration { get; set; }
        public string? Status { get; set; }
    }

    // Fields to receive the data from Firebase 
    public class FirebaseBayData
    {
        public int distanceCm { get; set; }
        public bool isLive { get; set; }
        public string? occupiedByUserId { get; set; }
        public string? status { get; set; }
    }
}