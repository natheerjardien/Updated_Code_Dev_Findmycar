//(rudderz243,2026)
import React, { useState} from "react";
import ParkingLayout from "../components/ParkingLayout.tsx";
import { useNavigate } from "react-router-dom";


export const BookPage: React.FC = () => {
 
  const [selectedBay, setSelectedBay] = useState<string | null>(null);
  const navigate = useNavigate();
  // where return starts = the actual HTML/display area
  return (

  //(realCain,2024)
    <section
      className="page is-active"
      data-page-panel="dashboard"
      aria-labelledby="dashboardTitle"
    >

      {/* PAGE HEADING */}
      <div className="page-heading">

        <div>

          <p className="eyebrow">
            Campus parking
          </p>

          <h1 id="dashboardTitle">
            Good morning
          </h1>

          <p>
            Here's a clear look at what's happening across campus parking.
          </p>

        </div>

        <div className="heading-actions">

          <button
            className="button secondary"
            type="button"
            onClick={() => navigate("/tickets")}
          >
            View tickets
          </button>

          <button
            className="button primary"
            type="button"
          >
            Parking map
          </button>

        </div>

      </div>


      {/* STAT CARDS */}
      <div className="stat-list">

        <article
          className="stat-card searchable"
          data-search="parking bays total spaces"
        >

          <div className="stat-top">

            <span className="stat-icon violet">
              <i
                className="fa-solid fa-square-parking"
                aria-hidden="true"
              ></i>
            </span>

          </div>

          <p>Total parking bays</p>

          <strong className="stat-value">
            14
          </strong>

          <small>
            Campus parking capacity
          </small>

        </article>


        <article
          className="stat-card searchable"
          data-search="occupied parking spaces"
        >

          <div className="stat-top">

            <span className="stat-icon blue">
              <i
                className="fa-solid fa-car"
                aria-hidden="true"
              ></i>
            </span>

          </div>

          <p>Currently occupied</p>

          <strong className="stat-value">
            6
          </strong>

          <small>
            Live occupancy
          </small>

        </article>


        <article
          className="stat-card searchable"
          data-search="available parking spaces"
        >

          <div className="stat-top">

            <span className="stat-icon green">
              <i
                className="fa-solid fa-circle-check"
                aria-hidden="true"
              ></i>
            </span>

          </div>

          <p>Available spaces</p>

          <strong className="stat-value">
            8
          </strong>

          <small>
            Spaces currently available
          </small>

        </article>


        <article
          className="stat-card searchable"
          data-search="tickets parking complaints"
        >

          <div className="stat-top">

            <span className="stat-icon orange">
              <i
                className="fa-solid fa-ticket"
                aria-hidden="true"
              ></i>
            </span>

          </div>

          <p>Tickets today</p>

          <strong className="stat-value">
            0
          </strong>

          <small>
            Parking issues reported today
          </small>

        </article>

      </div>


      <div className="dashboard-row">

        {/* MAP */}
        <article
          className="panel performance-panel searchable"
          data-search="parking map campus parking bays"
        >

          <div className="panel-heading">

            <div>

              <p className="panel-kicker">
                Live updates
              </p>

              <h2>
                Parking map
              </h2>

            </div>

            <div className="range-control">
              <button
                type="button"
                className="is-active"
              >
                Live
              </button>
            </div>

          </div>


          <div className="chart-summary">

            <strong>
              Campus parking
            </strong>

            <span>
              <i></i>
              Live availability
            </span>

          </div>



          <div
            className="chart-box"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "500px",
            }}
          >

            {/*  <img
                  src={parkingMap}
                  alt="Campus parking map"
                  style={{
                    width: "100%",
                    height: "500px",
                    objectFit: "contain",
                  }}
                /> */}
            <ParkingLayout
              onBayClick={(bayId) => setSelectedBay(bayId)}
            />

          </div>

        </article>


        {/* PARKING OVERVIEW */}
        <article
          className="panel conversion-panel searchable"
          data-search="parking overview availability occupancy"
        >

          <div className="panel-heading">

            <div>

              <p className="panel-kicker">
                Availability
              </p>

              <h2>
                Parking overview
              </h2>

            </div>

          </div>


          <div className="donut-wrap">

            <div
              className="donut"
              role="img"
              aria-label="43 percent of parking bays occupied"
            >

              <span>

                <strong>
                  43%
                </strong>

                <small>
                  Occupied
                </small>

              </span>

            </div>

          </div>


          <ul className="channel-list">

            <li>
              <span>
                <i className="violet-dot"></i>
                Total bays
              </span>

              <strong>
                14
              </strong>
            </li>

            <li>
              <span>
                <i className="blue-dot"></i>
                Occupied
              </span>

              <strong>
                6
              </strong>
            </li>

            <li>
              <span>
                <i className="green-dot"></i>
                Available
              </span>

              <strong>
                8
              </strong>
            </li>

          </ul>

        </article>

      </div>

      <div className="dashboard-row lower-row">

        {/* PARKING BAY */}
        <article
          className="panel activity-panel searchable"
          data-search="parking bay selected bay information"
        >

          <div className="panel-heading">

            <div>

              <p className="panel-kicker">
                Parking selection
              </p>

              <h2>
                Parking bay
              </h2>

            </div>

            <button
              className="text-button"
              type="button"
              onClick={() => setSelectedBay(null)}
            >
              Clear
            </button>

          </div>


          <div className="table-wrap">

            {selectedBay ? (

              <div>

                <p>
                  Selected parking bay
                </p>

                <h2>
                  {selectedBay}
                </h2>

                <p>
                  <span className="status success">
                    Sensor Status: Online

                  </span>
                </p>

                <span className="status pending">
                  Occupied by:  ST10266906

                </span>


                <p>
                  <span className="status pending">
                    Since: 8:00am

                  </span>
                </p>

              </div>

            ) : (

              <div>

                <p>
                  Select a parking bay on the map to view its information.
                </p>

                <span className="status pending">
                  No bay selected
                </span>

              </div>

            )}

          </div>

        </article>
        {/* LIVE PARKING ACTIVITY */}
        <article
          className="panel team-panel searchable"
          data-search="parking activity live updates"
        >

          <div className="panel-heading">

            <div>

              <p className="panel-kicker">
                Live updates
              </p>

              <h2>
                Parking activity
              </h2>

            </div>

            <span className="team-score">
              Live
            </span>

          </div>


          <div className="goal-list">

            <div>

              <span>

                <strong>
                  Available spaces
                </strong>

                <small>
                  8 of 14 spaces available
                </small>

              </span>

              <span className="goal-bar">
                <i style={{ width: "57%" }}></i>
              </span>

            </div>


            <div>

              <span>

                <strong>
                  Occupied spaces
                </strong>

                <small>
                  6 of 14 spaces occupied
                </small>

              </span>

              <span className="goal-bar">
                <i style={{ width: "43%" }}></i>
              </span>

            </div>


            <div>

              <span>

                <strong>
                  Parking status
                </strong>

                <small>
                  Sensors reporting normally
                </small>

              </span>

              <span className="goal-bar">
                <i style={{ width: "100%" }}></i>
              </span>

            </div>

          </div>


          <button
            className="button soft full-button"
            type="button"
          >
            View parking details
          </button>

        </article>

      </div>

    </section>


  );
};

{/*References
           realCAiN. 2024. Updated* Dashboard for sales, ect / Admin Dashboard. (Version 2.0) [Source code] Available at: < https://codepen.io/realCaiN/pen/yLdEzwv > [Accessed 16 Aug. 2026]. 
               rudderz243.2026. rudderz243/insy7314-library.  (Version 2.0) [Source code]. Available at: <https://github.com/rudderz243/insy7314-library> [Accessed 17 Aug. 2026].
           */}  
