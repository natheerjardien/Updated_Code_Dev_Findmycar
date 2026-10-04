
-- User Related Tables
-- Create the User table
CREATE TABLE [User] (
    userID INT PRIMARY KEY IDENTITY(1,1),
    firebaseUid NVARCHAR(255) NOT NULL UNIQUE,
    userNumber NVARCHAR(50) NOT NULL UNIQUE,
    name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL,
    userRole NVARCHAR(255) NOT NULL DEFAULT 'User',
    isParked BIT NOT NULL DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT GETUTCDATE()
);

CREATE TABLE [Student] (
    userID INT PRIMARY KEY,
    studentNumber NVARCHAR(50) NOT NULL,
    yearOfStudy INT NOT NULL DEFAULT 1,
    CONSTRAINT FK_Student_User FOREIGN KEY (userID) REFERENCES [User](userID) ON DELETE CASCADE
);

CREATE TABLE [Lecturer] (
    userID INT PRIMARY KEY,
    staffNumber NVARCHAR(50) NOT NULL,
    facultyDepartment NVARCHAR(100) NOT NULL DEFAULT 'General',
    CONSTRAINT FK_Lecturer_User FOREIGN KEY (userID) REFERENCES [User](userID) ON DELETE CASCADE
);

CREATE TABLE [SecurityPersonnel] (
    userID INT PRIMARY KEY,
    employeeNumber NVARCHAR(50) NOT NULL,
    assignedShift NVARCHAR(50) NOT NULL DEFAULT 'Day',
    CONSTRAINT FK_SecurityPersonnel_User FOREIGN KEY (userID) REFERENCES [User](userID) ON DELETE CASCADE
);

-- Parking Related Tables
-- Create the ParkingLot table
CREATE TABLE ParkingLot (
    parkingID INT PRIMARY KEY IDENTITY(1,1),
    lotName NVARCHAR(255) NOT NULL,
    campusLocation NVARCHAR(255) NOT NULL,
    totalCapacity INT NOT NULL
);

CREATE TABLE ParkingSection (
    sectionID INT PRIMARY KEY IDENTITY(1,1), 
    parkingID INT NOT NULL,
    sectionName NVARCHAR(255) NOT NULL,
    CONSTRAINT FK_ParkingSection_Parking 
        FOREIGN KEY (parkingID) REFERENCES ParkingLot(parkingID) ON DELETE CASCADE
);

-- Create the ParkingLayout table
-- CREATE TABLE ParkingLayout (
--     layoutID INT PRIMARY KEY IDENTITY(1,1), 
--     parkingID INT NOT NULL,
--     sectionName NVARCHAR(255) NOT NULL,
--     CONSTRAINT FK_ParkingLayout_Parking FOREIGN KEY (parkingID) REFERENCES ParkingLot(parkingID) ON DELETE CASCADE
-- );

-- Create the ParkingBay table
CREATE TABLE ParkingBay (
    bayID INT PRIMARY KEY IDENTITY(1,1),
    sectionID INT NOT NULL,
    bayNumber NVARCHAR(255) NOT NULL,
    isOccupied BIT NOT NULL DEFAULT 0,
    CONSTRAINT FK_ParkingBay_ParkingSection
        FOREIGN KEY (sectionID) REFERENCES ParkingSection(sectionID) ON DELETE CASCADE
);

-- Part of analytics
-- Create the ParkingSession table
CREATE TABLE ParkingSession (
    sessionID INT PRIMARY KEY IDENTITY(1,1),
    userID INT NOT NULL,
    bayID INT NOT NULL,
    startDate DATETIME NOT NULL,
    endDate DATETIME NULL,
    CONSTRAINT FK_ParkingSession_User
        FOREIGN KEY (userID) REFERENCES [User](userID) ON DELETE CASCADE,
    CONSTRAINT FK_ParkingSession_ParkingBay
        FOREIGN KEY (bayID) REFERENCES ParkingBay(bayID)
);

-- Part of analytics
-- Create the Sensor table
CREATE TABLE Sensor (
    sensorID INT PRIMARY KEY IDENTITY(1,1),
    bayID INT NOT NULL,
    distanceReadingCm INT NOT NULL,
    hardwareModel NVARCHAR(255) NOT NULL,
    location GEOGRAPHY NULL,
    beaconNodeKey NVARCHAR(100) NULL,
    firebaseBayKey NVARCHAR(100) NULL,
    CONSTRAINT FK_Sensor_ParkingBay FOREIGN KEY (bayID) REFERENCES ParkingBay(bayID) ON DELETE CASCADE
);

-- Create the FindMyCar table
CREATE TABLE FindMyCar (
    findMyCarID INT PRIMARY KEY IDENTITY(1,1),
    userLocation GEOGRAPHY NOT NULL,
    sensorLocation GEOGRAPHY NOT NULL,
    distance FLOAT NOT NULL,
    direction NVARCHAR(255) NOT NULL
);

-- Create the Permissions table
CREATE TABLE Permissions (
    permissionsID INT PRIMARY KEY IDENTITY(1,1),
    userID INT NOT NULL,
    bluetooth BIT NOT NULL,
    location BIT NOT NULL,
    ruleAlerts BIT NOT NULL,
     CONSTRAINT FK_Permissions_User FOREIGN KEY (userID) REFERENCES [User](userID) ON DELETE CASCADE
);

-- Create the Preferences table
CREATE TABLE Preferences (
    settingsID INT PRIMARY KEY IDENTITY(1,1),
    userID INT NOT NULL, --firebase user id is an INT
    text FLOAT,
    colorMode NVARCHAR(255),
    screenReader BIT NOT NULL,
    hapticFeedback BIT NOT NULL,
    language NVARCHAR(255),
    location NVARCHAR(255),
    emailNotifications BIT NOT NULL,
    pushNotifications BIT NOT NULL,
    [textSize] NVARCHAR(10) NOT NULL,
    reduceMotion BIT NOT NULL,
    CONSTRAINT FK_Preferences_User FOREIGN KEY (userID) REFERENCES [User](userID) ON DELETE CASCADE

);

-- Settings table (security web app)
CREATE TABLE Settings (
    settingsID INT PRIMARY KEY IDENTITY(1,1),
    -- Stores the firebase uid of the user
    userID NVARCHAR(255) NOT NULL UNIQUE,
    darkMode BIT NOT NULL DEFAULT 0,
    compactTables BIT NOT NULL DEFAULT 0,
    ticketUpdates BIT NOT NULL DEFAULT 1,
    parkingAlerts BIT NOT NULL DEFAULT 1,
    systemAlerts BIT NOT NULL DEFAULT 1,
    alertSound BIT NOT NULL DEFAULT 1,
    rememberDevice BIT NOT NULL DEFAULT 0,
    largerText BIT NOT NULL DEFAULT 0,
    reducedMotion BIT NOT NULL DEFAULT 0,
    CONSTRAINT FK_Settings_User FOREIGN KEY (userID)
        REFERENCES [User](firebaseUid) ON DELETE CASCADE
);


-- Create the Tickets table
CREATE TABLE Tickets (
    ticketID INT PRIMARY KEY IDENTITY(1,1),
    reportingUserID NVARCHAR(128) NULL, -- user that reports ticket 
    userID NVARCHAR(128) NOT NULL, --stores firebase user uid
    bayID NVARCHAR(50) NOT NULL,
    bayNumber NVARCHAR(50) NOT NULL,
    sectionID NVARCHAR(50) NOT NULL,
    reason NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX) NULL,
    imageURL NVARCHAR(500) NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NULL,
    response NVARCHAR(MAX) NULL
);

-- Create ChatBot table
CREATE TABLE ChatBot (
    chatID INT PRIMARY KEY IDENTITY(1,1),
    question NVARCHAR(255),
    selected INT,
    answer NVARCHAR(255)
);

-- Create Notification table
-- named Notifications (plural) because the backend queries [Notifications]
CREATE TABLE Notifications (
    notificationID INT PRIMARY KEY IDENTITY(1,1),
    notificationType NVARCHAR(255) NOT NULL,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(255) NOT NULL,
    time DATETIME NOT NULL
);

--Create App Rating table (the popup)
CREATE TABLE Ratings (
    ratingID INT PRIMARY KEY IDENTITY(1,1),
    userID INT NOT NULL,
    value INT NOT NULL,
    label NVARCHAR(20) NOT NULL,
    submittedAt DATETIME NOT NULL,
    CONSTRAINT FK_AppRating_User FOREIGN KEY (userID) REFERENCES [User](userID) ON DELETE CASCADE
);

--Creating a table to handle push tokens sent by security to user mobile app
CREATE TABLE PushToken (
    tokenID INT PRIMARY KEY IDENTITY(1,1),
    userID NVARCHAR(128) NOT NULL,
    token NVARCHAR(255) NOT NULL UNIQUE,
    platform NVARCHAR(20) NOT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NULL
);
GO