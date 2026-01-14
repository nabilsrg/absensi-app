import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import './login.css';

export default function LoginPage({ auth }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('login-body');
    return () => document.body.classList.remove('login-body');
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { username, password });
      const token = res?.data?.accessToken;
      if (!token) throw new Error('Token missing');
      auth.login(token);
      navigate('/', { replace: true });
    } catch (err) {
      const message = err?.response?.data?.message || 'Login failed';
      setError(Array.isArray(message) ? message.join(', ') : String(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <section className="login-left">
          <div className="brand">
            <div className="brand-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 11l9-7 9 7" />
                <path d="M5 10v10h14V10" />
                <path d="M9 16l2 2 4-4" />
              </svg>
            </div>
            <div>
              <div className="brand-title">Absensi WFH</div>
              <div className="brand-subtitle">Absensi kerja dari rumah</div>
            </div>
          </div>

          <p className="hero-text">
            Absen dengan bukti foto dan waktu otomatis, terintegrasi dengan monitoring HRD.
          </p>

          <ul className="feature-list">
            <li>
              <span className="feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 3" />
                </svg>
              </span>
              Timestamp otomatis
            </li>
            <li>
              <span className="feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="6" width="18" height="14" rx="2" />
                  <path d="M8 6l2-3h4l2 3" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
              </span>
              Upload foto bukti kerja
            </li>
            <li>
              <span className="feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3l7 4v6c0 5-3.5 7.5-7 8-3.5-.5-7-3-7-8V7l7-4z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </span>
              Monitoring oleh HRD
            </li>
          </ul>

          <div className="illustration">
            <svg viewBox="0 0 320 160" role="img" aria-label="Ilustrasi kerja di rumah">
              <defs>
                <linearGradient id="deskGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#f3f6ff" />
                  <stop offset="1" stopColor="#dbe4ff" />
                </linearGradient>
              </defs>
              <rect x="10" y="18" width="300" height="120" rx="16" fill="url(#deskGrad)" />
              <rect x="40" y="40" width="120" height="60" rx="8" fill="#ffffff" />
              <rect x="55" y="50" width="90" height="40" rx="6" fill="#b6c7ff" />
              <circle cx="210" cy="80" r="18" fill="#ffffff" />
              <rect x="192" y="96" width="36" height="22" rx="6" fill="#ffffff" />
              <rect x="70" y="110" width="160" height="12" rx="6" fill="#a4b7ff" />
              <circle cx="240" cy="114" r="6" fill="#a4b7ff" />
            </svg>
          </div>
        </section>

        <section className="login-right">
          <div className="login-header">
            <h1>Masuk</h1>
            <p>Gunakan akun perusahaan Anda</p>
          </div>

          <form onSubmit={onSubmit} className="login-form">
            <label className="input-group">
              <span className="input-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
                  <path d="M22 8l-10 6L2 8" />
                </svg>
              </span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Email / NIK Karyawan"
                required
              />
            </label>

            <label className="input-group">
              <span className="input-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="4" y="10" width="16" height="10" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
              <button
                type="button"
                className="icon-button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </label>

            <div className="login-row">
              <label className="checkbox">
                <input type="checkbox" />
                Ingat saya
              </label>
            </div>

            {error ? <div className="form-error">{error}</div> : null}

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Loading...' : 'Masuk'}
            </button>

            <div className="login-note">
              Dengan masuk, Anda menyetujui kebijakan perusahaan.
            </div>
          </form>
        </section>
      </div>

      <footer className="login-footer">v1.0.0  •  © Perusahaan  •  Bantuan</footer>
    </div>
  );
}
