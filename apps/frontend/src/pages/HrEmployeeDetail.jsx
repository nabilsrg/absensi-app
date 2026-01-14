import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import EmployeeShell from '../components/EmployeeShell.jsx';
import './hr-pages.css';

export default function HrEmployeeDetailPage({ auth }) {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [deactivating, setDeactivating] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    setSuccess('');
    api
      .get(`/hr/employees/${id}`)
      .then((res) => setEmployee(res?.data || null))
      .catch((err) => {
        const message = err?.response?.data?.message || 'Gagal memuat detail.';
        setError(Array.isArray(message) ? message.join(', ') : String(message));
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <EmployeeShell auth={auth} title="Employee Detail">
      <div className="employee-full hrd-page">
        <section className="hrd-card">
          <div className="hrd-header">
            <div>
              <h3>Employee Detail</h3>
              <p>Informasi lengkap karyawan.</p>
            </div>
            <div className="hrd-tabs">
              <Link className="hrd-tab active" to={`/hr/employees/${id}`}>
                Detail
              </Link>
              <Link className="hrd-tab" to={`/hr/employees/${id}/edit`}>
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

          {employee ? (
            <div className="hrd-detail-grid">
              <div>
                <span className="label">Employee Code</span>
                <span>{employee.employeeCode}</span>
              </div>
              <div>
                <span className="label">Full Name</span>
                <span>{employee.fullName}</span>
              </div>
              <div>
                <span className="label">Email</span>
                <span>{employee.email || '-'}</span>
              </div>
              <div>
                <span className="label">Phone</span>
                <span>{employee.phone || '-'}</span>
              </div>
              <div>
                <span className="label">Department</span>
                <span>{employee.department || '-'}</span>
              </div>
              <div>
                <span className="label">Position</span>
                <span>{employee.position || '-'}</span>
              </div>
              <div>
                <span className="label">Active</span>
                <span>{employee.isActive ? 'Yes' : 'No'}</span>
              </div>
            </div>
          ) : null}

          {employee ? (
            <div className="hrd-actions">
              <button
                type="button"
                className={employee.isActive ? 'hrd-danger' : 'hrd-success-action'}
                disabled={deactivating}
                onClick={() => {
                  const nextActive = !employee.isActive;
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
                      setEmployee({ ...employee, isActive: nextActive });
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
                  ? employee.isActive
                    ? 'Deactivating...'
                    : 'Activating...'
                  : employee.isActive
                    ? 'Deactivate'
                    : 'Activate'}
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </EmployeeShell>
  );
}
