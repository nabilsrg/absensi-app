import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import EmployeeShell from '../components/EmployeeShell.jsx';
import './hr-pages.css';

const emptyForm = {
  employeeCode: '',
  fullName: '',
  email: '',
  phone: '',
  department: '',
  position: '',
  isActive: true,
};

export default function HrEmployeeEditPage({ auth }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setLoading(true);
    api
      .get(`/hr/employees/${id}`)
      .then((res) => {
        const data = res?.data || {};
        setForm({
          employeeCode: data.employeeCode || '',
          fullName: data.fullName || '',
          email: data.email || '',
          phone: data.phone || '',
          department: data.department || '',
          position: data.position || '',
          isActive: data.isActive ?? true,
        });
      })
      .catch((err) => {
        const message = err?.response?.data?.message || 'Gagal memuat data.';
        setError(Array.isArray(message) ? message.join(', ') : String(message));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await api.patch(`/hr/employees/${id}`, {
        employeeCode: form.employeeCode.trim() || undefined,
        fullName: form.fullName.trim() || undefined,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        department: form.department.trim() || undefined,
        position: form.position.trim() || undefined,
        isActive: form.isActive,
      });
      setSuccess('Employee updated.');
      setTimeout(() => navigate(`/hr/employees/${id}`), 600);
    } catch (err) {
      const message = err?.response?.data?.message || 'Gagal update employee.';
      setError(Array.isArray(message) ? message.join(', ') : String(message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <EmployeeShell auth={auth} title="Edit Employee">
      <div className="employee-full hrd-page">
        <section className="hrd-card">
          <div className="hrd-header">
            <div>
              <h3>Edit Employee</h3>
              <p>Perbarui data karyawan.</p>
            </div>
            <div className="hrd-tabs">
              <Link className="hrd-tab" to={`/hr/employees/${id}`}>
                Detail
              </Link>
              <Link className="hrd-tab active" to={`/hr/employees/${id}/edit`}>
                Edit
              </Link>
              <Link className="hrd-tab" to="/hr/employees">
                Back
              </Link>
            </div>
          </div>

          {loading ? <div className="hrd-meta">Loading...</div> : null}
          {error ? <div className="hrd-error">{error}</div> : null}
          {success ? <div className="hrd-success">{success}</div> : null}

          {!loading ? (
            <form className="hrd-form" onSubmit={onSubmit}>
              <div className="hrd-grid">
                <label>
                  <span>Employee Code</span>
                  <input
                    required
                    value={form.employeeCode}
                    onChange={(e) => setForm({ ...form, employeeCode: e.target.value })}
                  />
                </label>
                <label>
                  <span>Full Name</span>
                  <input
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  />
                </label>
              </div>
              <div className="hrd-grid">
                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </label>
                <label>
                  <span>Phone</span>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </label>
              </div>
              <div className="hrd-grid">
                <label>
                  <span>Department</span>
                  <input
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                  />
                </label>
                <label>
                  <span>Position</span>
                  <input
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                  />
                </label>
              </div>
              <div className="hrd-actions">
                <button type="submit" className="hrd-primary hrd-primary--compact" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className={form.isActive ? 'hrd-danger' : 'hrd-success-action'}
                  disabled={deactivating}
                  onClick={() => {
                    const nextActive = !form.isActive;
                    const prompt = nextActive
                      ? 'Activate employee ini?'
                      : 'Deactivate employee ini?';
                    if (!window.confirm(prompt)) return;
                    setDeactivating(true);
                    setError('');
                    const action = nextActive
                      ? api.patch(`/hr/employees/${id}`, { isActive: true })
                      : api.delete(`/hr/employees/${id}`);
                    action
                      .then(() => {
                        setForm((prev) => ({ ...prev, isActive: nextActive }));
                        setSuccess(nextActive ? 'Employee activated.' : 'Employee deactivated.');
                      })
                      .catch((err) => {
                        const message = nextActive
                          ? err?.response?.data?.message || 'Gagal mengaktifkan employee.'
                          : err?.response?.data?.message || 'Gagal menonaktifkan employee.';
                        setError(Array.isArray(message) ? message.join(', ') : String(message));
                      })
                      .finally(() => setDeactivating(false));
                  }}
                >
                  {deactivating
                    ? form.isActive
                      ? 'Deactivating...'
                      : 'Activating...'
                    : form.isActive
                      ? 'Deactivate'
                      : 'Activate'}
                </button>
              </div>
            </form>
          ) : null}
        </section>
      </div>
    </EmployeeShell>
  );
}
