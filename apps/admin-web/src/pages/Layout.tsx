import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { currentUser, logout } from '../lib/auth';

export default function Layout() {
  const nav = useNavigate();
  const user = currentUser();

  return (
    <div>
      <div className="nav">
        <div className="row">
          <strong>Rental Mobil Admin</strong>
          <span className="muted">{user ? `${user.name} (${user.role})` : ''}</span>
        </div>
        <div className="row">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Dashboard
          </NavLink>
          <NavLink to="/vehicles" className={({ isActive }) => (isActive ? 'active' : '')}>
            Vehicles
          </NavLink>
          <NavLink to="/rentals" className={({ isActive }) => (isActive ? 'active' : '')}>
            Rentals
          </NavLink>
          <NavLink to="/maintenance" className={({ isActive }) => (isActive ? 'active' : '')}>
            Maintenance
          </NavLink>
          <NavLink to="/audit-logs" className={({ isActive }) => (isActive ? 'active' : '')}>
            Audit Logs
          </NavLink>
          <button
            className="btn secondary"
            onClick={() => {
              logout();
              nav('/login');
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="container">
        <Outlet />
      </div>
    </div>
  );
}
