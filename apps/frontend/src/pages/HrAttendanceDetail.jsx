import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import EmployeeShell from '../components/EmployeeShell.jsx';
import './hr-pages.css';

const API_BASE =
  import.meta.env.VITE_ATTENDANCE_API_BASE_URL || 'http://localhost:3002';

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString('id-ID') : '-';
}

function formatDateTime(value) {
  return value ? new Date(value).toLocaleString('id-ID') : '-';
}

export default function HrAttendanceDetailPage({ auth }) {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError('');
    api
      .get(`/hr/attendances/${id}`)
      .then((res) => setRecord(res?.data || null))
      .catch((err) => {
        const message = err?.response?.data?.message || 'Gagal memuat detail.';
        setError(Array.isArray(message) ? message.join(', ') : String(message));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const photos = useMemo(() => record?.photos || [], [record]);

  return (
    <EmployeeShell auth={auth} title="Attendance Detail">
      <div className="employee-full hrd-page">
        <section className="hrd-card">
          <div className="hrd-header">
            <div>
              <h3>Attendance Detail</h3>
              <p>Detail absensi karyawan.</p>
            </div>
            <div className="hrd-tabs">
              <Link className="hrd-tab" to="/hr/attendances">
                Back
              </Link>
            </div>
          </div>

          {loading ? <div className="hrd-meta">Loading...</div> : null}
          {error ? <div className="hrd-error">{error}</div> : null}

          {record ? (
            <div className="hrd-detail-grid">
              <div>
                <span className="label">Employee</span>
                <span>
                  {record.employee?.employeeCode || '-'} - {record.employee?.fullName || '-'}
                </span>
              </div>
              <div>
                <span className="label">Status</span>
                <span>{record.status || '-'}</span>
              </div>
              <div>
                <span className="label">Attendance Date</span>
                <span>{formatDate(record.attendanceDate)}</span>
              </div>
              <div>
                <span className="label">Check-in</span>
                <span>{formatDateTime(record.checkInAt)}</span>
              </div>
              <div>
                <span className="label">Note</span>
                <span>{record.note || '-'}</span>
              </div>
            </div>
          ) : null}
        </section>

        <section className="hrd-card">
          <div className="hrd-header">
            <div>
              <h3>Foto Bukti</h3>
              <p>Dokumentasi absensi.</p>
            </div>
          </div>
          {photos.length === 0 ? (
            <div className="hrd-meta">Tidak ada foto.</div>
          ) : (
            <div className="hrd-photo-grid">
              {photos.map((photo) => (
                <a
                  key={photo.id}
                  href={`${API_BASE}${photo.filePath}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hrd-photo-item"
                >
                  <img src={`${API_BASE}${photo.filePath}`} alt={photo.fileName || 'Bukti'} />
                  <span>{photo.fileName || 'Bukti'}</span>
                </a>
              ))}
            </div>
          )}
        </section>
      </div>
    </EmployeeShell>
  );
}
