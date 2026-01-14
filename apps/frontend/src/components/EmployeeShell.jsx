import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './employee-shell.css';

function formatTime(value) {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(value);
}

export default function EmployeeShell({ auth, children, title = 'Absensi WFH' }) {
  const [now, setNow] = useState(new Date());
  const userName = auth.user?.username || 'Karyawan';
  const role = auth.user?.role || 'Employee';
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const path = location.pathname;
  const isDashboard = path === '/employee';
  const isHRD = role === 'HRD';

  useEffect(() => {
    document.body.classList.add('employee-body-bg');
    return () => document.body.classList.remove('employee-body-bg');
  }, []);

  const currentTime = useMemo(() => formatTime(now), [now]);

  return (
    <div className="employee-dashboard">
      <div className="employee-shell">
        <header className="employee-topbar">
          <Link className="employee-brand" to="/employee">
            <div className="brand-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 11l9-7 9 7" />
                <path d="M5 10v10h14V10" />
                <path d="M9 16l2 2 4-4" />
              </svg>
            </div>
            <span>{title}</span>
          </Link>

          <div className="employee-clock">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" />
            </svg>
            <span>{currentTime}</span>
          </div>

          <div className="employee-user">
            <div className="avatar" aria-hidden="true">
              <span>{userName.slice(0, 1).toUpperCase()}</span>
            </div>
            <div>
              <div className="user-name">{userName}</div>
              <div className="user-role">{role}</div>
            </div>
            <Link className="logout" to="/login" onClick={auth.logout}>
              Keluar
            </Link>
          </div>
        </header>

        {!isHRD ? (
          <nav className="employee-nav">
            {!isDashboard ? (
              <Link className="employee-nav-link employee-nav-back" to="/employee">
                ← Back
              </Link>
            ) : null}
            {isDashboard ? (
              <Link className="employee-nav-link active" to="/employee">
                Dashboard
              </Link>
            ) : null}
            <Link
              className={`employee-nav-link ${path.startsWith('/employee/check-in') ? 'active' : ''}`}
              to="/employee/check-in"
            >
              Check-in
            </Link>
            <Link
              className={`employee-nav-link ${path.startsWith('/employee/history') ? 'active' : ''}`}
              to="/employee/history"
            >
              History
            </Link>
          </nav>
        ) : null}

        <main className="employee-body">{children}</main>

        <footer className="employee-footer">v1.0.0 • © Perusahaan • Bantuan</footer>
      </div>
    </div>
  );
}
