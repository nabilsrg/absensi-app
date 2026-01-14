import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import EmployeeShell from '../components/EmployeeShell.jsx';
import DataTable from '../components/DataTable.jsx';
import './hr-pages.css';

const initialForm = {
  employeeCode: '',
  fullName: '',
  email: '',
  phone: '',
  department: '',
  position: '',
  isActive: true,
};

export default function HrEmployeesPage({ auth }) {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pageSize: 20, total: 0 });
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState('');
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setListError('');
    try {
      const params = {
        page: meta.page,
        pageSize: meta.pageSize,
        search: search.trim() || undefined,
      };
      if (activeFilter !== 'all') {
        params.isActive = activeFilter === 'active';
      }
      const res = await api.get('/hr/employees', { params });
      setRows(res?.data?.data || []);
      setMeta((prev) => res?.data?.meta || prev);
    } catch (err) {
      const message = err?.response?.data?.message || 'Gagal memuat data.';
      setListError(Array.isArray(message) ? message.join(', ') : String(message));
    } finally {
      setLoading(false);
    }
  }, [meta.page, meta.pageSize, search, activeFilter]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const onCreate = async (event) => {
    event.preventDefault();
    setFormError('');
    setSuccess('');

    const payload = {
      employeeCode: form.employeeCode.trim(),
      fullName: form.fullName.trim(),
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      department: form.department.trim() || undefined,
      position: form.position.trim() || undefined,
      isActive: form.isActive,
    };

    try {
      await api.post('/hr/employees', payload);
      setSuccess('Employee created.');
      setForm(initialForm);
      fetchEmployees();
    } catch (err) {
      const message = err?.response?.data?.message || 'Gagal membuat employee.';
      setFormError(Array.isArray(message) ? message.join(', ') : String(message));
    }
  };

  const columns = useMemo(
    () => [
      { label: 'Code', key: 'employeeCode' },
      { label: 'Name', key: 'fullName' },
      { label: 'Email', key: 'email' },
      { label: 'Department', key: 'department' },
      { label: 'Position', key: 'position' },
      {
        label: 'Active',
        render: (row) => (row.isActive ? 'Yes' : 'No'),
      },
      {
        label: 'Action',
        render: (row) => (
          <div className="hrd-actions-inline">
            <Link className="hrd-action-link" to={`/hr/employees/${row.id}`}>
              Detail
            </Link>
            <Link className="hrd-action-link" to={`/hr/employees/${row.id}/edit`}>
              Edit
            </Link>
          </div>
        ),
      },
    ],
    [],
  );

  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / (meta.pageSize || 1)));
  const startIndex = meta.total === 0 ? 0 : (meta.page - 1) * meta.pageSize + 1;
  const endIndex = Math.min(meta.total, meta.page * meta.pageSize);

  return (
    <EmployeeShell auth={auth} title="HRD Employees">
      <div className="employee-full hrd-page">
        <section className="hrd-card">
          <div className="hrd-header">
            <div>
              <h3>Create Employee</h3>
              <p>Tambah data master karyawan baru.</p>
            </div>
            <div className="hrd-tabs">
              <Link className="hrd-tab active" to="/hr/employees">
                Employees
              </Link>
              <Link className="hrd-tab" to="/hr/attendances">
                Attendances
              </Link>
            </div>
          </div>
          <form onSubmit={onCreate} className="hrd-form">
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
            {formError ? <div className="hrd-error">{formError}</div> : null}
            {success ? <div className="hrd-success">{success}</div> : null}
            <div className="hrd-actions">
              <button type="submit" className="hrd-primary hrd-primary--compact">
                Create Employee
              </button>
            </div>
          </form>
        </section>

        <section className="hrd-card">
          <div className="hrd-header">
            <h3>Employee List</h3>
            <p>Kelola data master karyawan.</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (meta.page === 1) {
                fetchEmployees();
              } else {
                setMeta((prev) => ({ ...prev, page: 1 }));
              }
            }}
            className="hrd-filters"
          >
            <input
              placeholder="Search name/code/email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <label>
              <span>Page Size</span>
              <select
                value={meta.pageSize}
                onChange={(e) =>
                  setMeta((prev) => ({ ...prev, page: 1, pageSize: Number(e.target.value) }))
                }
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </label>
            <button type="submit" disabled={loading} className="hrd-secondary">
              {loading ? 'Loading...' : 'Apply'}
            </button>
          </form>

          {listError ? <div className="hrd-error">{listError}</div> : null}
          <div className="hrd-table">
            <DataTable columns={columns} rows={rows} />
          </div>
          <div className="hrd-pagination">
            <span>
              {startIndex}-{endIndex} of {meta.total}
            </span>
            <span>
              Page {meta.page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setMeta((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={loading || meta.page <= 1}
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() =>
                setMeta((prev) => ({
                  ...prev,
                  page: Math.min(totalPages, prev.page + 1),
                }))
              }
              disabled={loading || meta.page >= totalPages}
            >
              Next
            </button>
          </div>
        </section>
      </div>
    </EmployeeShell>
  );
}
