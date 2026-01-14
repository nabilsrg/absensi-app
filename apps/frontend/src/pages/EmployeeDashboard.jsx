import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import EmployeeShell from '../components/EmployeeShell.jsx';
import './employee-dashboard.css';

const API_BASE =
  import.meta.env.VITE_ATTENDANCE_API_BASE_URL || 'http://localhost:3002';

function formatDate(value) {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(value);
}

function formatTime(value) {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(value);
}

function formatShortDate(value) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(value));
}

export default function EmployeeDashboardPage({ auth }) {
  const [now, setNow] = useState(new Date());
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(4);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const userName = auth.user?.username || 'Karyawan';

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    api
      .get('/attendance/me', { params: { page, pageSize } })
      .then((res) => {
        setHistory(res?.data?.data || []);
        setTotal(res?.data?.meta?.total || 0);
      })
      .catch((err) => {
        const message = err?.response?.data?.message || 'Gagal memuat riwayat.';
        setError(Array.isArray(message) ? message.join(', ') : String(message));
      });
  }, [page, pageSize]);

  const greetingDate = useMemo(() => formatDate(now), [now]);
  const currentTime = useMemo(() => formatTime(now), [now]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <EmployeeShell auth={auth} title="Dashboard">
      <div className="employee-main">
        <div className="welcome">
          <h1>Selamat datang, {userName}!</h1>
          <p>{greetingDate}</p>
        </div>

        <section className="card absensi-card">
          <div className="absensi-info">
            <h2>Absen Kerja di Rumah</h2>
            <div className="absensi-time">
              <div className="calendar-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M16 3v4M8 3v4M3 11h18" />
                </svg>
              </div>
              <div>
                <div className="absensi-date">{greetingDate}</div>
                <div className="absensi-clock">{currentTime}</div>
              </div>
            </div>
            <Link className="absen-button" to="/employee/check-in">
              Absen Sekarang
            </Link>
          </div>
          <div className="absensi-visual" aria-hidden="true">
            <div className="clock-face" />
          </div>
        </section>

        <section className="card history-card">
          <div className="history-header">
            <h3>Riwayat Absensi</h3>
            <Link to="/employee/history">Lihat detail</Link>
          </div>
          {error ? <div className="error-text">{error}</div> : null}
          <table className="history-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Waktu Absen</th>
                <th>Foto Bukti</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-row">
                    Belum ada data.
                  </td>
                </tr>
              ) : (
                history.map((row) => {
                  const photo = row.photos?.[0];
                  const photoUrl = photo ? `${API_BASE}${photo.filePath}` : null;
                  return (
                    <tr key={row.id}>
                      <td>{formatShortDate(row.attendanceDate)}</td>
                      <td>{row.checkInAt ? formatTime(new Date(row.checkInAt)) : '-'}</td>
                      <td>
                        {photoUrl ? (
                          <img src={photoUrl} alt="Bukti" className="proof-thumb" />
                        ) : (
                          <span className="muted">-</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge status-${row.status?.toLowerCase()}`}>
                          {row.status || '-'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <div className="history-footer">
            <div className="history-meta">
              Menampilkan {history.length} dari {total} data
            </div>
            <div className="pagination">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, index) => {
                const value = index + 1;
                return (
                  <button
                    key={value}
                    type="button"
                    className={value === page ? 'active' : ''}
                    onClick={() => setPage(value)}
                  >
                    {value}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>

      <aside className="employee-side">
        <section className="card tips-card">
          <h3>Tips Absen WFH</h3>
          <ul>
            <li>Pastikan wajah terlihat jelas di foto.</li>
            <li>Ambil foto di area kerja rumah Anda.</li>
            <li>Pastikan waktu absensi sudah benar.</li>
          </ul>
          <div className="tips-illustration">
            <svg viewBox="0 0 240 120" aria-hidden="true">
              <rect x="10" y="20" width="220" height="80" rx="14" fill="#eef3ff" />
              <circle cx="180" cy="60" r="18" fill="#a5bdf0" />
              <rect x="30" y="60" width="80" height="8" rx="4" fill="#9eb3df" />
              <rect x="30" y="45" width="60" height="8" rx="4" fill="#9eb3df" />
            </svg>
          </div>
        </section>
      </aside>
    </EmployeeShell>
  );
}
