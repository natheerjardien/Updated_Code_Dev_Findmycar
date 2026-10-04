//(rudderz243,2026)
import React, { useEffect, useState } from "react";
import { auth } from "../config/firebase";
import { onAuthStateChanged, updateEmail, updateProfile } from "firebase/auth"; //(Firebase, 2026)

const getUserSettingsKey = (uid: string, setting: string) =>
  `parkitects_${uid}_${setting}`;

type Preferences = {
  darkMode: boolean;
  compactTables: boolean;
  largerText: boolean;
  reducedMotion: boolean;
  rememberDevice: boolean;
};

type Notifications = {
  ticketUpdates: boolean;
  parkingAlerts: boolean;
  systemAlerts: boolean;
  alertSound: boolean;
};

const defaultPreferences: Preferences = {
  darkMode: false,
  compactTables: false,
  largerText: false,
  reducedMotion: false,
  rememberDevice: false,
};

const defaultNotifications: Notifications = {
  ticketUpdates: true,
  parkingAlerts: true,
  systemAlerts: true,
  alertSound: true,
};


export const SettingsPage: React.FC = () => {

  
  const [activeSection, setActiveSection] = useState("General");

  //Stores the loggd in user's details
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [profileLoaded, setProfileLoaded] = useState(false);


  //Web security settings
  const [notifications, setNotifications] = useState<Notifications>(defaultNotifications);

  //(Leiberman, 2021)
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);

    useEffect(() => {

    const handleThemeChange = (event: Event) => {

      const customEvent =
        event as CustomEvent;
        const currentUid =auth.currentUser?.uid;
        const eventUid = customEvent.detail?.uid;

        if(eventUid && currentUid && eventUid !== currentUid)
        {
          return;
        }

      setPreferences((current) => ({
        ...current,
        darkMode: Boolean(customEvent.detail?.darkMode),
      }));
    };

    window.addEventListener("themeChange", handleThemeChange);

    return () => {
      window.removeEventListener("themeChange", handleThemeChange);
    };
  }, []);

  // Apply appearance preferences and cache them for this user.
  useEffect(() => {
    const theme = preferences.darkMode ? "dark" : "light";
    const uid = auth.currentUser?.uid;

    document.documentElement.setAttribute("data-theme", theme);

    if (uid) {
      localStorage.setItem(
        getUserSettingsKey(uid, "theme"),
        theme
      );
    }
  }, [preferences.darkMode]);

  useEffect(() => {
    const value = String(preferences.compactTables);
    const uid = auth.currentUser?.uid;

    document.documentElement.setAttribute("data-compact", value);

    if (uid) {
      localStorage.setItem(
        getUserSettingsKey(uid, "compactTables"),
        value
      );
    }
  }, [preferences.compactTables]);

  useEffect(() => {
    const value = String(preferences.largerText);
    const uid = auth.currentUser?.uid;

    document.documentElement.setAttribute("data-larger-text", value);

    if (uid) {
      localStorage.setItem(
        getUserSettingsKey(uid, "largerText"),
        value
      );
    }
  }, [preferences.largerText]);

  useEffect(() => {
    const value = String(preferences.reducedMotion);
    const uid = auth.currentUser?.uid;

    document.documentElement.setAttribute("data-reduced-motion", value);

    if (uid) {
      localStorage.setItem(
        getUserSettingsKey(uid, "reducedMotion"),
        value
      );
    }
  }, [preferences.reducedMotion]);

  useEffect(() => {
    const uid = auth.currentUser?.uid;

    if (uid) {
      localStorage.setItem(
        getUserSettingsKey(uid, "rememberDevice"),
        String(preferences.rememberDevice)
      );
    }
  }, [preferences.rememberDevice]);


  //This loads the current user's details
  useEffect(() => {

    //Firebase loads the logged in user
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {

    
      if (!currentUser) {
        setUserName("");
        setUserEmail("");
        setProfileLoaded(false);
        return;
      }

      //Gets the user's name from firebase


      //get's the logged in user's name from firebase
      setUserName(currentUser.displayName || "");
      //get's the user's email from firebase
      setUserEmail(currentUser.email || "");
      setProfileLoaded(true);
      
    });

    return() => unsubscribe();

  }, []);

  //(Akbulut, 2022)
  //This sends the user's details to the top bar so it can be displayed in the profile section
  useEffect(() => {
    if(!profileLoaded) 
      {
        return;
      }
    window.dispatchEvent(
      new CustomEvent("profileLoad", {
        detail: { 
          name: userName,
          email: userEmail
        },
      })
    );
  }, [profileLoaded, userName, userEmail]);


  useEffect(() => {
    return () => {
      window.dispatchEvent(new CustomEvent("profileUnload"));
    };
  }, []);

    // Load settings belonging to the signed-in user.
  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        if (!active) return;

        setPreferences(defaultPreferences);
        setNotifications(defaultNotifications);

        document.documentElement.setAttribute("data-theme", "light");
        document.documentElement.setAttribute("data-compact", "false");
        document.documentElement.setAttribute("data-larger-text", "false");
        document.documentElement.setAttribute("data-reduced-motion", "false");

        return;
      }

      const uid = currentUser.uid;

      try {
        const response = await fetch(`/api/Settings/web/${uid}`);

        if (!response.ok) {
          throw new Error(`Failed to load settings (${response.status}).`);
        }

        const settings = await response.json();

        // Do not apply a response belonging to an account that signed out.
        if (!active || auth.currentUser?.uid !== uid) return;

        const loadedPreferences: Preferences = {
          darkMode:
            settings.darkMode ??
            (localStorage.getItem(getUserSettingsKey(uid, "theme")) === "dark"),
          compactTables:
            settings.compactTables ??
            (localStorage.getItem(getUserSettingsKey(uid, "compactTables")) === "true"),
          largerText:
            settings.largerText ??
            (localStorage.getItem(getUserSettingsKey(uid, "largerText")) === "true"),
          reducedMotion:
            settings.reducedMotion ??
            (localStorage.getItem(getUserSettingsKey(uid, "reducedMotion")) === "true"),
          rememberDevice:
            settings.rememberDevice ??
            (localStorage.getItem(getUserSettingsKey(uid, "rememberDevice")) === "true"),
        };

        setPreferences(loadedPreferences);

        setNotifications({
          ticketUpdates: settings.ticketUpdates ?? true,
          parkingAlerts: settings.parkingAlerts ?? true,
          systemAlerts: settings.systemAlerts ?? true,
          alertSound: settings.alertSound ?? true,
        });

        // Keep the top bar synchronised with this user's saved theme.
        window.dispatchEvent(
          new CustomEvent("themeChange", {
            detail: {
              darkMode: loadedPreferences.darkMode,
              uid,
            },
          })
        );
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    });

    return () => unsubscribe();
  }, []);

  //Saves the user's settings 
  const handleSave = async () => {
    const currentUser = auth.currentUser;

    if(!currentUser) {
      alert("Please log in first.");
      return;
    }

    try {
      //Updates the user's name in firebase
      if(userName.trim() !== ""){
        await updateProfile(currentUser, {
          displayName: userName.trim(),
        });
      }

      //Updates user's email in firebase
      if(userEmail.trim() !== "" && userEmail.trim() !== currentUser.email){
        await updateEmail(
          currentUser,
          userEmail.trim()
        );
      }
      
      //saves the settings to the backend
      const response = await fetch(
        `/api/Settings/web/${currentUser.uid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userID: currentUser.uid,

            // Web settings
            darkMode: preferences.darkMode,
            compactTables: preferences.compactTables,
            largerText: preferences.largerText,
            reducedMotion: preferences.reducedMotion,
            rememberDevice: preferences.rememberDevice,

            //Notification settings
            ticketUpdates: notifications.ticketUpdates,
            parkingAlerts: notifications.parkingAlerts,
            systemAlerts: notifications.systemAlerts,
            alertSound: notifications.alertSound,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Settings save failed (${response.status}): ${errorText}`);
      }

      const uid = currentUser.uid;

      //this is so the selected theme stays active after navigating to other screens
      localStorage.setItem(
        "theme", preferences.darkMode ? "dark" : "light" //(Leiberman, 2021)
      );
      localStorage.setItem(
        "compactTables", preferences.compactTables ? "true" : "false"
      );
      localStorage.setItem(
        "largerText", preferences.largerText ? "true" : "false"
      );
      localStorage.setItem(
        "reducedMotion", preferences.reducedMotion ? "true" : "false"
      );
      localStorage.setItem(
        "rememberDevice", preferences.rememberDevice ? "true" : "false");
        localStorage.setItem(
          "alertSound", notifications.alertSound ? "true" : "false"
        );

        window.dispatchEvent(
        new CustomEvent("themeChange", {
          detail: {
            darkMode: preferences.darkMode,
            uid,
          },
        })
      );


        window.dispatchEvent(new CustomEvent("profileLoad", {
          detail: {
            name: userName,
            email: userEmail
          },
        }));

      alert("Settings saved successfully.");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings.");
    }
  };
  
  return (
    <section
      className="page is-active"
      aria-labelledby="settingsTitle"
    >

      {/* PAGE HEADING */}
      <div className="page-heading">
        <div>
          <p className="eyebrow">System preferences</p>

          <h1 id="settingsTitle">
            Settings
          </h1>

          <p>
            Manage your account, notifications, and parking system preferences.
          </p>
        </div>

        <button
          className="button primary"
          type="button"
          onClick={handleSave}
        >
          Save changes
        </button>
      </div>

      <div className="settings-layout">

    {/* Settings nav */}
        <nav
          className="settings-nav"
          aria-label="Settings sections"
        >
          {[
            "General",
            "Notifications",
            "Security",
            "System",
          ].map((section) => (
            <button
              key={section}
              type="button"
              className={
                activeSection === section
                  ? "is-active"
                  : ""
              }
              onClick={() => setActiveSection(section)}
            >
              {section}
            </button>
          ))}
        </nav>


        {/* SETTINGS CONTENT */}
        <div className="settings-content">

          {/* GENERAL */}
          {activeSection === "General" && (
            <>
              <article className="panel setting-group searchable">
                <h2>Account details</h2>

                <p>
                  Manage the information associated with your Parkitects
                  security account.
                </p>

                <div className="form-row">
                  <label>
                    Full name
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                    />
                  </label>

                  <label>
                    Email address
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                    />
                  </label>
                </div>
              </article>

              <article className="panel setting-group searchable">
                <h2>Appearance</h2>

                <p>
                  Choose how the Parkitects dashboard appears.
                </p>

                {/* DARK MODE */}
                <div className="setting-line">
                  <span>
                    <strong>Dark theme</strong>

                    <small>
                      Use a darker interface in low-light environments.
                    </small>
                  </span>

                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={preferences.darkMode}
                      onChange={(e) => {
                        const darkMode = e.target.checked;

                        setPreferences({
                          ...preferences,
                          darkMode: darkMode, 
                        });
                        //saves the theme
                        localStorage.setItem(
                          "theme", darkMode ? "dark" : "light"
                        );
                      }}
                    />

                    <span></span>
                  </label>
                </div>

                {/* COMPACT TABLES */}
                <div className="setting-line">
                  <span>
                    <strong>Compact tables</strong>

                    <small>
                      Display more parking records in tables.
                    </small>
                  </span>

                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={preferences.compactTables}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          compactTables: e.target.checked,
                        })
                      }
                    />

                    <span></span>
                  </label>
                </div>

                                {/* LARGER TEXT */}

                <div className="setting-line">

                  <span>

                    <strong>
                      Larger text
                    </strong>

                    <small>
                      Increase text size throughout
                      the Parkitects dashboard.
                    </small>

                  </span>


                  <label className="switch">

                    <input
                      type="checkbox"
                      checked={
                        preferences.largerText
                      }
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          largerText:
                            e.target.checked,
                        })
                      }
                    />

                    <span></span>

                  </label>

                </div>


                {/* REDUCE MOTION */}

                <div className="setting-line">

                  <span>

                    <strong>
                      Reduce motion
                    </strong>

                    <small>
                      Reduce animations and movement
                      throughout the dashboard.
                    </small>

                  </span>


                  <label className="switch">

                    <input
                      type="checkbox"
                      checked={
                        preferences.reducedMotion
                      }
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          reducedMotion:
                            e.target.checked,
                        })
                      }
                    />

                    <span></span>

                  </label>

                </div>
              </article>
            </>
          )}

          {/* NOTIFICATION SETTINGS */}
          {activeSection === "Notifications" && (
            <article className="panel setting-group searchable">

              <h2>Notifications</h2>

              <p>
                Choose which parking system events security staff are
                notified about.
              </p>

              {/* TICKET UPDATES */}
              <div className="setting-line">
                <span>
                  <strong>Ticket updates</strong>

                  <small>
                    Receive notifications when a ticket is created,
                    disputed, or resolved.
                  </small>
                </span>

                <label className="switch">
                  <input
                    type="checkbox"
                    checked={notifications.ticketUpdates}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        ticketUpdates: e.target.checked,
                      })
                    }
                  />

                  <span></span>
                </label>
              </div>

              {/* PARKING ALERTS */}
              <div className="setting-line">
                <span>
                  <strong>Parking alerts</strong>

                  <small>
                    Receive alerts about parking capacity and bay
                    availability.
                  </small>
                </span>

                <label className="switch">
                  <input
                    type="checkbox"
                    checked={notifications.parkingAlerts}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        parkingAlerts: e.target.checked,
                      })
                    }
                  />

                  <span></span>
                </label>
              </div>

              {/* SYSTEM ALERTS */}
              <div className="setting-line">
                <span>
                  <strong>System alerts</strong>

                  <small>
                    Receive important system and sensor notifications.
                  </small>
                </span>

                <label className="switch">
                  <input
                    type="checkbox"
                    checked={notifications.systemAlerts}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        systemAlerts: e.target.checked,
                      })
                    }
                  />

                  <span></span>
                </label>
              </div>
                            {/* ALERT SOUND */}

              <div className="setting-line">

                <span>

                  <strong>
                    Alert sound
                  </strong>

                  <small>
                    Play a sound when important
                    parking or system alerts are received.
                  </small>

                </span>


                <label className="switch">

                  <input
                    type="checkbox"
                    checked={
                      notifications.alertSound
                    }
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        alertSound:
                          e.target.checked,
                      })
                    }
                  />

                  <span></span>

                </label>

              </div>

            </article>
          )}

          {/* SECURITY SETTINGS */}
          {activeSection === "Security" && (

            <article className="panel setting-group searchable">

              <h2>
                Security
              </h2>

              <p>
                Manage security preferences for
                your Parkitects web account.
              </p>


              {/* REMEMBER DEVICE */}

              <div className="setting-line">

                <span>

                  <strong>
                    Remember this device
                  </strong>

                  <small>
                    Remember this browser so you
                    do not need to verify the device
                    as often.
                  </small>

                </span>


                <label className="switch">

                  <input
                    type="checkbox"
                    checked={
                      preferences.rememberDevice
                    }
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        rememberDevice:
                          e.target.checked,
                      })
                    }
                  />

                  <span></span>

                </label>

              </div>

            </article>

          )}


          {/* SYSTEM SETTINGS */}
          {activeSection === "System" && (
            <>
              <article className="panel setting-group searchable">

                <h2>Parking system</h2>

                <p>
                  Information about the Parkitects parking monitoring
                  system.
                </p>

                <div className="setting-line">
                  <span>
                    <strong>Parking sensors</strong>

                    <small>
                      Monitor the connection status of parking bay sensors.
                    </small>
                  </span>

                  <span className="status success">
                    Connected
                  </span>
                </div>

                <div className="setting-line">
                  <span>
                    <strong>System status</strong>

                    <small>
                      Current Parkitects system availability.
                    </small>
                  </span>

                  <span className="status success">
                    Operational
                  </span>
                </div>

              </article>

              <article className="panel setting-group searchable">

                <h2>Data management</h2>

                <p>
                  Manage historical parking and ticket information.
                </p>

                <button
                  className="button secondary"
                  type="button"
                >
                  Export parking data
                </button>

              </article>
            </>
          )}

        </div>
      </div>
    </section>
  );
};


export default SettingsPage;
{/*References
  Akbulut, U. 2022. JavaScript: Understanding CustomEvent and dispatchEvent. (Version 2.0) [Source Code] Available at:<https://medium.com/cstech/javascript-understanding-customevent-and-dispatchevent-a33d10075818> [Accessed 1 October 2026].
  Firebase. 2026. Manage Users in Firebase. (Version 2.0) [Source Code] Available at:<https://firebase.google.com/docs/auth/web/manage-users> [Accessed 27 September 2026].
  Leiberman, L. 2021. Dark Mode 2.0 : With Local Storage. (Version 2.0) [Source Code] Available at:<https://dr-lucasleibs.medium.com/dark-mode-2-0-with-local-storage-6f992683204d> [Accessed 27 September 2026].
  Mustafamulla. 2024. How to Implement Dark Mode in React with Tailwind CSS. (Version 2.0) [Source Code] Available at:<https://medium.com/@mustafamulla765/how-to-implement-dark-mode-in-react-with-tailwind-css-94df7522ed82> [Accessed 25 September 2026].
  realCAiN. 2024. Updated* Dashboard for sales, ect / Admin Dashboard. (Version 2.0) [Source code] Available at: < https://codepen.io/realCaiN/pen/yLdEzwv > [Accessed 16 August 2026].        
  rudderz243.2026. rudderz243/insy7314-library.  (Version 2.0) [Source code]. Available at: <https://github.com/rudderz243/insy7314-library> [Accessed 17 August 2026].
           */}
       