import React from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

export function DataTable<T extends { id: number }>({
  data,
  columns,
  onEdit,
  onDelete,
}: DataTableProps<T>) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd', backgroundColor: '#f5f5f5' }}>
            {columns.map((col) => (
              <th key={col.key} style={{ padding: '12px', textAlign: 'left' }}>
                {col.header}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} style={{ padding: '20px', textAlign: 'center' }}>
                No data available
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
                {columns.map((col) => (
                  <td key={col.key} style={{ padding: '12px' }}>
                    {col.render
                      ? col.render(item)
                      : String((item as any)[col.key] || '')}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td style={{ padding: '12px' }}>
                    {onEdit && (
                      <button
                        onClick={() => onEdit(item)}
                        style={{
                          marginRight: '8px',
                          padding: '6px 12px',
                          cursor: 'pointer',
                        }}
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(item)}
                        style={{
                          padding: '6px 12px',
                          cursor: 'pointer',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
