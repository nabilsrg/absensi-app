import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import EmployeeShell from '../components/EmployeeShell.jsx';
import './employee-checkin.css';

export default function EmployeeCheckInPage({ auth }) {
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const previewUrl = useMemo(() => (photo ? URL.createObjectURL(photo) : ''), [photo]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setResult(null);

    if (!photo) {
      setError('Photo wajib diupload.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('photo', photo);
      if (note.trim()) formData.append('note', note.trim());

      const res = await api.post('/attendance/check-in', formData);
      setResult(res?.data || null);
      setSuccess('Data berhasil disimpan.');
      setNote('');
      setPhoto(null);
    } catch (err) {
      const message = err?.response?.data?.message || 'Gagal check-in.';
      setError(Array.isArray(message) ? message.join(', ') : String(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <EmployeeShell auth={auth} title="Check-in">
      <div className="employee-full checkin-layout">
        <form className="checkin-card" onSubmit={onSubmit}>
          <div className="checkin-header">
            <h3>Absen Kerja di Rumah</h3>
            <p>Lengkapi catatan singkat dan upload foto bukti.</p>
          </div>

          <label className="checkin-field">
            <span>Note (optional)</span>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: WFH dari rumah"
            />
          </label>

          <label className="checkin-field">
            <span>Upload Photo (JPG/PNG)</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            />
          </label>

          <div className="checkin-preview">
            {photo ? (
              <>
                <img src={previewUrl} alt="Preview" />
                <div className="file-name">{photo.name}</div>
              </>
            ) : (
              <div className="placeholder">
                <span>Preview foto akan muncul di sini.</span>
              </div>
            )}
          </div>

          {error ? <div className="checkin-error">{error}</div> : null}
          <button type="submit" className="checkin-submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Check-in'}
          </button>
        </form>

        <div className="checkin-card result-card">
          <h3>Ringkasan Check-in</h3>
          {!result ? (
            <p className="checkin-muted">Belum ada check-in hari ini.</p>
          ) : (
            <div className="result-grid">
              {success ? <div className="checkin-success">{success}</div> : null}
              <div>
                <span className="label">Status</span>
                <span>{result.status}</span>
              </div>
              <div>
                <span className="label">Attendance Date</span>
                <span>{result.attendanceDate}</span>
              </div>
              <div>
                <span className="label">Check-in At</span>
                <span>{new Date(result.checkInAt).toLocaleString()}</span>
              </div>
              <div>
                <span className="label">Record ID</span>
                <span>{result.id}</span>
              </div>
              <button
                type="button"
                className="checkin-submit"
                onClick={() => navigate('/employee')}
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </EmployeeShell>
  );
}
