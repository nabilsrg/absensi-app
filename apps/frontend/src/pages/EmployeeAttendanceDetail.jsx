import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import EmployeeShell from '../components/EmployeeShell.jsx';
import './employee-attendance-detail.css';

const API_BASE =
  import.meta.env.VITE_ATTENDANCE_API_BASE_URL || 'http://localhost:3002';

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString('id-ID') : '-';
}

function formatDateTime(value) {
  return value ? new Date(value).toLocaleString('id-ID') : '-';
}

export default function EmployeeAttendanceDetailPage({ auth }) {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError('');
    api
      .get(`/attendance/${id}`)
      .then((res) => setRecord(res?.data || null))
      .catch((err) => {
        const message = err?.response?.data?.message || 'Gagal memuat detail.';
        setError(Array.isArray(message) ? message.join(', ') : String(message));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const photos = useMemo(() => record?.photos || [], [record]);

  return (
    <EmployeeShell auth={auth} title="Detail Absensi">
      <div className="employee-full detail-layout">
        <div className="detail-card">
          <div className="detail-header">
            <div>
              <h3>Absensi #{id}</h3>
              <p>{record ? formatDate(record.attendanceDate) : '-'}</p>
            </div>
            <span className={`status-pill status-${record?.status?.toLowerCase() || 'unknown'}`}>
              {record?.status || '-'}
            </span>
          </div>

          {loading ? <div className="detail-note">Loading...</div> : null}
          {error ? <div className="detail-error">{error}</div> : null}

          {record ? (
            <div className="detail-grid">
              <div className="detail-item">
                <span className="label">Tanggal</span>
                <span>{formatDate(record.attendanceDate)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Waktu Check-in</span>
                <span>{formatDateTime(record.checkInAt)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Catatan</span>
                <span>{record.note || '-'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Status</span>
                <span>{record.status || '-'}</span>
              </div>
            </div>
          ) : null}

          <div className="detail-actions">
            <Link to="/employee/history">Kembali ke Riwayat</Link>
          </div>
        </div>

        <div className="detail-card">
          <h3>Foto Bukti</h3>
          {photos.length === 0 ? (
            <div className="detail-note">Tidak ada foto.</div>
          ) : (
            <div className="photo-grid">
              {photos.map((photo) => (
                <a
                  key={photo.id}
                  href={`${API_BASE}${photo.filePath}`}
                  target="_blank"
                  rel="noreferrer"
                  className="photo-item"
                >
                  <img src={`${API_BASE}${photo.filePath}`} alt={photo.fileName || 'Bukti'} />
                  <span>{photo.fileName || 'Bukti'}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </EmployeeShell>
  );
}
