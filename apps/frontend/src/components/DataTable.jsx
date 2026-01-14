import React from 'react';

export default function DataTable({ columns, rows, keyField = 'id', emptyText = 'No data' }) {
  const hasRows = Array.isArray(rows) && rows.length > 0;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key || col.label}
                style={{
                  textAlign: 'left',
                  padding: '10px 8px',
                  borderBottom: '2px solid #ddd',
                  fontSize: 13,
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hasRows ? (
            rows.map((row) => (
              <tr key={row[keyField] ?? JSON.stringify(row)}>
                {columns.map((col) => (
                  <td
                    key={col.key || col.label}
                    style={{ padding: '8px', borderBottom: '1px solid #eee', fontSize: 13 }}
                  >
                    {col.render ? col.render(row) : row[col.key] ?? '-'}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} style={{ padding: '12px 8px', color: '#666' }}>
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
