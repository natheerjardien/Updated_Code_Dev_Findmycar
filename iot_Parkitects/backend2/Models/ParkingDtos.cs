
namespace backend2.Models
{
    //  Map summary DTO
    public class ParkingMapResponseDto
    {
        public int TotalBays { get; set; }
        public int AvailableBays { get; set; }
        public int OccupiedBays { get; set; }
        public List<SectionMapDto> Sections { get; set; } = new();
    }

    public class SectionMapDto
    {
        public int SectionID { get; set; }
        public string SectionName { get; set; } = string.Empty;
        public int TotalBays { get; set; }
        public int AvailableBays { get; set; }
        public List<BayMapDto> Bays { get; set; } = new();
    }

    public class BayMapDto
    {
        public int BayID { get; set; }
        public string BayNumber { get; set; } = string.Empty;
        public bool IsOccupied { get; set; }
        public bool HasPhysicalSensor { get; set; }
        public int? DistanceReadingCm { get; set; }
    }

    // [Ref: 3] IoT Hardware Payload DTO
    public class SensorIngestDto
    {
        public int SensorID { get; set; }
        public int DistanceReadingCm { get; set; }

        public bool? IsOccupied { get; set;}
    }


    public class BeaconBayDto
{
    public string NodeKey { get; set; } = string.Empty;
    public int BayID { get; set; }
    public string BayNumber { get; set; } = string.Empty;
    public string SectionName { get; set; } = string.Empty;
    public bool IsOccupied { get; set; }
}

public class ParkVehicleDto
{
    public string FirebaseUid { get; set; } = string.Empty;
    public int BayID { get; set; }
}
}

/*
 * References:
 * [Ref: 1] Microsoft Docs - Create Data Transfer Objects (DTOs) in ASP.NET Core.
 * [Ref: 2] Martin Fowler - Data Transfer Object Pattern.
 * [Ref: 3] RESTful API Design Specification - RFC 7231 Hypertext Transfer Protocol.
 */