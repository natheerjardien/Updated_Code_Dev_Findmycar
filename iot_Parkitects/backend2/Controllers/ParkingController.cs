// [Ref: 1]
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend2.Data;
using backend2.Models;

namespace backend2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ParkingController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ParkingController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Parking/map
        [HttpGet("map")]
        public async Task<ActionResult<ParkingMapResponseDto>> GetParkingMap()
        {
            // Seed base parking lot data if database is uninitialized
            await EnsureDatabaseSeededAsync();

            var sections = await _context.ParkingSections
                .Include(s => s.ParkingBays)
                    .ThenInclude(b => b.Sensor)
                .OrderBy(s => s.sectionName)
                .ToListAsync();

            var response = new ParkingMapResponseDto();

            foreach (var sec in sections)
            {
                var sectionDto = new SectionMapDto
                {
                    SectionID = sec.sectionID,
                    SectionName = sec.sectionName,
                    TotalBays = sec.ParkingBays.Count,
                    AvailableBays = sec.ParkingBays.Count(b => !b.isOccupied),
                    Bays = sec.ParkingBays
                        .OrderBy(b => b.bayID)
                        .Select(b => new BayMapDto
                        {
                            BayID = b.bayID,
                            BayNumber = b.bayNumber,
                            IsOccupied = b.isOccupied,
                            HasPhysicalSensor = b.Sensor != null,
                            DistanceReadingCm = b.Sensor?.distanceReadingCm
                        }).ToList()
                };

                response.Sections.Add(sectionDto);
            }

            response.TotalBays = response.Sections.Sum(s => s.TotalBays);
            response.AvailableBays = response.Sections.Sum(s => s.AvailableBays);
            response.OccupiedBays = response.TotalBays - response.AvailableBays;

            return Ok(response);
        }

        //  POST: api/Parking/sensor/telemetry
        [HttpPost("sensor/telemetry")]
        public async Task<IActionResult> UpdateSensorTelemetry([FromBody] SensorIngestDto dto)
        {
            var sensor = await _context.Sensors
    .Include(s => s.ParkingBay)
    .FirstOrDefaultAsync(s => s.sensorID == dto.SensorID);

            if (sensor == null) return NotFound("Sensor not found.");

            sensor.distanceReadingCm = dto.DistanceReadingCm;

            if (sensor.ParkingBay != null)
            {
                // Trust the sensor's own verdict; fall back to distance if it isn't sent
                var occupied = dto.IsOccupied ?? (dto.DistanceReadingCm > 0 && dto.DistanceReadingCm <= 60);
                sensor.ParkingBay.isOccupied = occupied;

                if (!occupied)
                {
                    var open = await _context.ParkingSessions
                        .Where(s => s.bayID == sensor.ParkingBay.bayID && s.endDate == null)
                        .ToListAsync();

                    foreach (var s in open)
                    {
                        s.endDate = DateTime.UtcNow;
                        var u = await _context.Users.FindAsync(s.userID);
                        if (u != null) u.IsParked = false;
                    }
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Sensor telemetry updated successfully.", isOccupied = sensor.ParkingBay?.isOccupied });
        }

        // Idempotent generator for the 350-bay facility
        private async Task EnsureDatabaseSeededAsync()
        {
            if (await _context.ParkingLots.AnyAsync())
            {
                return;
            }

            var lot = new ParkingLot
            {
                lotName = "Main Campus Lot",
                campusLocation = "North Sector",
                totalCapacity = 350
            };
            _context.ParkingLots.Add(lot);
            await _context.SaveChangesAsync();

            string[] sectionLabels = { "A", "B", "C", "D", "E" };
            var random = new Random(42); // Deterministic seed for reproducible testing

            foreach (var label in sectionLabels)
            {
                var section = new ParkingSection
                {
                    parkingID = lot.parkingID,
                    sectionName = $"Section {label}"
                };
                _context.ParkingSections.Add(section);
                await _context.SaveChangesAsync();

                var bays = new List<ParkingBay>();
                for (int i = 1; i <= 70; i++)
                {
                    bool isBayOccupied = random.Next(0, 2) == 1;

                    // Physical sensors are assigned to Bay A1 and A2
                    if (label == "A" && (i == 1 || i == 2))
                    {
                        isBayOccupied = (i == 2);
                    }

                    bays.Add(new ParkingBay
                    {
                        sectionID = section.sectionID,
                        bayNumber = $"{label}{i}",
                        isOccupied = isBayOccupied
                    });
                }

                _context.ParkingBays.AddRange(bays);
                await _context.SaveChangesAsync();

                // Attach physical hardware nodes to Section A
                if (label == "A")
                {
                    var bay1 = bays.First(b => b.bayNumber == "A1");
                    var bay2 = bays.First(b => b.bayNumber == "A2");

                    _context.Sensors.AddRange(
                        new Sensor
                        {
                            bayID = bay1.bayID,
                            hardwareModel = "ESP32-HC-SR04-Node1",
                            distanceReadingCm = 150,
                            beaconNodeKey = "Node_01",
                            firebaseBayKey = "Bay1"
                        },
                        new Sensor
                        {
                            bayID = bay2.bayID,
                            hardwareModel = "ESP32-HC-SR04-Node2",
                            distanceReadingCm = 25,
                            beaconNodeKey = "Node_02",
                            firebaseBayKey = "Bay2"
                        }
                    );
                    await _context.SaveChangesAsync();
                }
            }
        }

        // GET: api/Parking/beacon/Node_01
        [HttpGet("beacon/{nodeKey}")]
        public async Task<IActionResult> GetBaysFromBeacon(string nodeKey)
        {
            var bays = await _context.Sensors
                .Where(s => s.beaconNodeKey == nodeKey && s.ParkingBay != null)
                .OrderBy(s => s.ParkingBay!.bayID)
                .Select(s => new BeaconBayDto
                {
                    NodeKey = nodeKey,
                    BayID = s.ParkingBay!.bayID,
                    BayNumber = s.ParkingBay.bayNumber,
                    SectionName = s.ParkingBay.ParkingSection != null
                        ? s.ParkingBay.ParkingSection.sectionName : "",
                    IsOccupied = s.ParkingBay.isOccupied
                })
                .ToListAsync();

            if (bays.Count == 0)
                return NotFound("No parking bays are linked to this beacon.");

            return Ok(bays);
        }
        // POST: api/Parking/park
        [HttpPost("park")]
        public async Task<IActionResult> ParkVehicle([FromBody] ParkVehicleDto dto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.FirebaseUid == dto.FirebaseUid);

            if (user == null)
            {
                return NotFound("User was not found.");
            }

            var bay = await _context.ParkingBays
                .FirstOrDefaultAsync(b => b.bayID == dto.BayID);

            if (bay == null)
            {
                return NotFound("Parking bay was not found.");
            }

            if (bay.isOccupied)
            {
                return Conflict("This parking bay is already occupied.");
            }

            // Prevent the same user from having multiple active parking sessions
            var existingSession = await _context.ParkingSessions
                .FirstOrDefaultAsync(s =>
                    s.userID == user.UserId &&
                    s.endDate == null);

            if (existingSession != null)
            {
                return Conflict("You already have an active parking session.");
            }

            var session = new ParkingSession
            {
                userID = user.UserId,
                bayID = bay.bayID,
                startDate = DateTime.UtcNow
            };

            bay.isOccupied = true;
            user.IsParked = true;

            _context.ParkingSessions.Add(session);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Parking session started successfully.",
                bayID = bay.bayID,
                bayNumber = bay.bayNumber,
                sessionID = session.sessionID,
                startDate = session.startDate
            });
        }

        //POST: api/Parking/session/start
        [HttpPost("session/start")]
        public async Task<IActionResult> StartSession([FromBody] StartSessionDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.FirebaseUid == dto.FirebaseUid);
            if (user == null) return NotFound("User was not found.");

            var sensor = await _context.Sensors
                .Include(s => s.ParkingBay)
                .FirstOrDefaultAsync(s => s.beaconNodeKey == dto.NodeKey && s.firebaseBayKey == dto.BayKey);
            if (sensor?.ParkingBay == null) return NotFound("No bay is linked to this sensor.");
            var bay = sensor.ParkingBay;

            var open = await _context.ParkingSessions
                .Where(s => s.userID == user.UserId && s.endDate == null)
                .ToListAsync();

            if (open.Any(s => s.bayID == bay.bayID))
                return Ok(new { message = "Session already active." });

            // A user can only be in one bay, so close any stale session
            foreach (var s in open) s.endDate = DateTime.UtcNow;

            var session = new ParkingSession
            {
                userID = user.UserId,
                bayID = bay.bayID,
                startDate = DateTime.UtcNow
            };

            bay.isOccupied = true;
            user.IsParked = true;
            _context.ParkingSessions.Add(session);
            await _context.SaveChangesAsync();

            return Ok(new { sessionID = session.sessionID, bayNumber = bay.bayNumber, startDate = session.startDate });
        }

        // GET: api/Parking/occupied  (bays that currently have a registered driver)
        [HttpGet("occupied")]
        public async Task<IActionResult> GetBaysWithDrivers()
        {
            var bays = await (
                from s in _context.ParkingSessions
                where s.endDate == null
                join b in _context.ParkingBays on s.bayID equals b.bayID
                select new { bayID = b.bayID, bayNumber = b.bayNumber })
                .Distinct()
                .OrderBy(x => x.bayNumber)
                .ToListAsync();

            return Ok(bays);
        }

    }



}

