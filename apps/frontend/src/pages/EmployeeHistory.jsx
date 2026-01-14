import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import EmployeeShell from '../components/EmployeeShell.jsx';
import DataTable from '../components/DataTable.jsx';
import './employee-history.css';

const API_BASE =
  import.meta.env.VITE_ATTENDANCE_API_BASE_URL || 'http://localhost:3002';

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : '-';
}

function formatDateTime(value) {
  return value ? new Date(value).toLocaleString() : '-';
}

export default function EmployeeHistoryPage({ auth }) {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pageSize: 20, total: 0 });
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/attendance/me', {
        params: {
          page: Number(meta.page) || 1,
          pageSize: Number(meta.pageSize) || 20,
          from: from || undefined,
          to: to || undefined,
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
  }, [meta.page, meta.pageSize, from, to]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / (meta.pageSize || 1)));
  const startIndex = meta.total === 0 ? 0 : (meta.page - 1) * meta.pageSize + 1;
  const endIndex = Math.min(meta.total, meta.page * meta.pageSize);

  const columns = useMemo(
    () => [
      { label: 'Date', key: 'attendanceDate', render: (row) => formatDate(row.attendanceDate) },
      { label: 'Check-in', key: 'checkInAt', render: (row) => formatDateTime(row.checkInAt) },
      { label: 'Status', key: 'status' },
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
        render: (row) => <Link to={`/employee/history/${row.id}`}>Lihat</Link>,
      },
    ],
    [],
  );

  return (
    <EmployeeShell auth={auth} title="Attendance History">
      <div className="employee-full">
        <div className="history-page">
          <div className="history-card">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (meta.page === 1) {
                  fetchHistory();
                } else {
                  setMeta((prev) => ({ ...prev, page: 1 }));
                }
              }}
              className="history-filters"
            >
              <label>
                <span>From</span>
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </label>
              <label>
                <span>To</span>
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
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
              <button type="submit" disabled={loading}>
                {loading ? 'Loading...' : 'Apply'}
              </button>
            </form>

            {error ? <div className="history-error">{error}</div> : null}
            <div className="history-table-wrap">
              <DataTable columns={columns} rows={rows} />
            </div>
            <div className="history-pagination">
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
          </div>
        </div>
      </div>
    </EmployeeShell>
  );
}
