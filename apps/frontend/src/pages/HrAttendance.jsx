import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import EmployeeShell from '../components/EmployeeShell.jsx';
import DataTable from '../components/DataTable.jsx';
import './hr-pages.css';

const API_BASE =
  import.meta.env.VITE_ATTENDANCE_API_BASE_URL || 'http://localhost:3002';

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : '-';
}

function formatDateTime(value) {
  return value ? new Date(value).toLocaleString() : '-';
}

export default function HrAttendancePage({ auth }) {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pageSize: 20, total: 0 });
  const [employeeId, setEmployeeId] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAttendances = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/hr/attendances', {
        params: {
          page: Number(meta.page) || 1,
          pageSize: Number(meta.pageSize) || 20,
          employeeId: employeeId ? Number(employeeId) : undefined,
          status: status || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      });
      setRows(res?.data?.data || []);
      setMeta((prev) => res?.data?.meta || prev);
    } catch (err) {
      const message = err?.response?.data?.message || 'Gagal memuat data.';
      setError(Array.isArray(message) ? message.join(', ') : String(message));
    } finally {
      setLoading(false);
    }
  }, [meta.page, meta.pageSize, employeeId, status, startDate, endDate]);

  useEffect(() => {
    fetchAttendances();
  }, [fetchAttendances]);

  const columns = useMemo(
    () => [
      { label: 'Date', key: 'attendanceDate', render: (row) => formatDate(row.attendanceDate) },
      {
        label: 'Employee',
        render: (row) => `${row.employee?.employeeCode || '-'} - ${row.employee?.fullName || '-'}`,
      },
      { label: 'Status', key: 'status' },
      { label: 'Check-in', key: 'checkInAt', render: (row) => formatDateTime(row.checkInAt) },
      { label: 'Note', key: 'note' },
      {
        label: 'Photo',
        render: (row) => {
          const photo = row.photos?.[0];
          if (!photo) return '-';
          const url = `${API_BASE}${photo.filePath}`;
          return (
            <a href={url} target="_blank" rel="noreferrer">
              View
            </a>
          );
        },
      },
      {
        label: 'Detail',
        render: (row) => <Link to={`/hr/attendances/${row.id}`}>Detail</Link>,
      },
    ],
    [],
  );

  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / (meta.pageSize || 1)));
  const startIndex = meta.total === 0 ? 0 : (meta.page - 1) * meta.pageSize + 1;
  const endIndex = Math.min(meta.total, meta.page * meta.pageSize);

  return (
    <EmployeeShell auth={auth} title="HRD Attendance">
      <div className="employee-full hrd-page">
        <section className="hrd-card">
          <div className="hrd-header">
            <div>
              <h3>Attendance Monitoring</h3>
              <p>Pantau absensi karyawan dengan filter.</p>
            </div>
            <div className="hrd-tabs">
              <Link className="hrd-tab" to="/hr/employees">
                Employees
              </Link>
              <Link className="hrd-tab active" to="/hr/attendances">
                Attendances
              </Link>
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchAttendances();
            }}
            className="hrd-filters"
          >
            <input
              placeholder="Employee ID"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            />
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All Status</option>
              <option value="PRESENT">PRESENT</option>
              <option value="LATE">LATE</option>
              <option value="LEAVE">LEAVE</option>
              <option value="SICK">SICK</option>
              <option value="ABSENT">ABSENT</option>
            </select>
            <label>
              <span>Start Date</span>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </label>
            <label>
              <span>End Date</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </label>
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

          {error ? <div className="hrd-error">{error}</div> : null}
          <div className="hrd-table hrd-table-attendance">
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
