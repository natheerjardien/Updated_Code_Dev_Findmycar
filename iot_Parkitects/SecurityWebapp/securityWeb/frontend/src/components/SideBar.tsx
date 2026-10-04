import React from "react";
import parkitechlogo from "../assets/parkitechlogo.png";
import { NavLink } from "react-router-dom";

interface SideBarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const SideBar: React.FC<SideBarProps> = ({
  collapsed,
  onToggle,
}) => {
  return (
    <aside className="sidebar">

      {/* Collapse button */}
      <button
        className="sidebar-toggle"
        type="button"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        onClick={onToggle}
      >
        <i
          className="fa-solid fa-chevron-left"
          aria-hidden="true"
        ></i>
      </button>

      {/* Brand */}
      <div className="brand">
        <span className="brand-mark">
            <img src={parkitechlogo} alt="Parkitech"/>
        </span>

        <span className="brand-copy">
          <strong>Parkitech</strong>
          <small>Smart Parking</small>
        </span>
      </div>

      {/* Navigation */}
      <nav className="primary-nav" aria-label="Primary navigation">

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `nav-item ${isActive ? "is-active" : ""}`
          }
        >
          <i
            className="nav-icon fa-solid fa-table-columns"
            aria-hidden="true"
          ></i>

          <span className="nav-label">Dashboard</span>
        </NavLink>

        <NavLink
          to="/tickets"
          className={({ isActive }) =>
            `nav-item ${isActive ? "is-active" : ""}`
          }
        >
          <i
            className="nav-icon fa-solid fa-ticket"
            aria-hidden="true"
          ></i>

          <span className="nav-label">Tickets</span>
        </NavLink>

        <NavLink
          to="/responses"
          className={({ isActive }) =>
            `nav-item ${isActive ? "is-active" : ""}`
          }
        >
          <i
            className="nav-icon fa-solid fa-square-parking"
            aria-hidden="true"
          ></i>

          <span className="nav-label">Ticket Responses</span>
        </NavLink>

        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            `nav-item ${isActive ? "is-active" : ""}`
          }
        >
          <i
            className="nav-icon fa-solid fa-chart-line"
            aria-hidden="true"
          ></i>

          <span className="nav-label">Analytics</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `nav-item ${isActive ? "is-active" : ""}`
          }
        >
          <i
            className="nav-icon fa-solid fa-gear"
            aria-hidden="true"
          ></i>

          <span className="nav-label">Settings</span>
        </NavLink>

      </nav>

      {/* Sidebar footer */}
      <div className="sidebar-footer">

        <div className="plan-card">

          <div className="plan-row">
            <span>Parking status</span>
            <strong>Live</strong>
          </div>

          <div className="progress-track">
            <span style={{ width: "72%" }}></span>
          </div>

          <small>Campus parking activity</small>

        </div>

        <button className="sidebar-user" type="button">

          <span className="avatar">P</span>

          <span className="user-copy">
            <strong>Parkitech</strong>
            <small>Administrator</small>
          </span>

          <i
            className="more-mark fa-solid fa-ellipsis"
            aria-hidden="true"
          ></i>

        </button>

      </div>

    </aside>
  );
};



export default SideBar;
{/*References
 realCAiN. 2024. Updated* Dashboard for sales, ect / Admin Dashboard. (Version 2.0) [Source code] Available at: < https://codepen.io/realCaiN/pen/yLdEzwv > [Accessed 16 Aug. 2026]. 
               
 */}