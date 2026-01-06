import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

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
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.key} sx={{ fontWeight: 'bold' }}>
                {col.header}
              </TableCell>
            ))}
            {(onEdit || onDelete) && (
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + 1} align="center">
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  No data available
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item.id} hover>
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    {col.render
                      ? col.render(item)
                      : String((item as any)[col.key] || '')}
                  </TableCell>
                ))}
                {(onEdit || onDelete) && (
                  <TableCell>
                    {onEdit && (
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onEdit(item)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    {onDelete && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete(item)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
