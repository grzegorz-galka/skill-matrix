import { useState } from 'react';
import { Container, Box, Typography, Button, Paper, TextField, Stack } from '@mui/material';
import { useEmployees } from '../hooks/useEmployees';
import { DataTable } from '../components/DataTable';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { Employee, EmployeeRequest } from '../types';
import { employeeService } from '../services/employeeService';

export function EmployeesPage() {
  const [page] = useState(0);
  const { employees, loading, error, refetch } = useEmployees(page, 20);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<EmployeeRequest>({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    position: '',
  });

  const handleCreate = () => {
    setEditingEmployee(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      department: '',
      position: '',
    });
    setShowForm(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      department: employee.department || '',
      position: employee.position || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (employee: Employee) => {
    if (confirm(`Delete employee ${employee.firstName} ${employee.lastName}?`)) {
      try {
        await employeeService.delete(employee.id);
        refetch();
      } catch (err) {
        alert('Failed to delete employee');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        await employeeService.update(editingEmployee.id, formData);
      } else {
        await employeeService.create(formData);
      }
      setShowForm(false);
      refetch();
    } catch (err) {
      alert('Failed to save employee');
    }
  };

  const columns = [
    { key: 'firstName', header: 'First Name' },
    { key: 'lastName', header: 'Last Name' },
    { key: 'email', header: 'Email' },
    { key: 'department', header: 'Department' },
    { key: 'position', header: 'Position' },
  ];

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Employees
        </Typography>
        <Button variant="contained" color="primary" onClick={handleCreate}>
          Add Employee
        </Button>
      </Box>

      {showForm && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            {editingEmployee ? 'Edit Employee' : 'New Employee'}
          </Typography>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                fullWidth
                variant="outlined"
                size="small"
              />
              <TextField
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                fullWidth
                variant="outlined"
                size="small"
              />
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                fullWidth
                variant="outlined"
                size="small"
              />
              <TextField
                label="Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                fullWidth
                variant="outlined"
                size="small"
              />
              <TextField
                label="Position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                fullWidth
                variant="outlined"
                size="small"
              />
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button type="submit" variant="contained" color="success">
                  Save
                </Button>
                <Button variant="outlined" color="secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </form>
        </Paper>
      )}

      {employees && (
        <DataTable
          data={employees.content}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {employees && (
        <Typography variant="body2" align="center" sx={{ mt: 3 }}>
          Page {employees.page + 1} of {employees.totalPages} (Total: {employees.totalElements} employees)
        </Typography>
      )}
    </Container>
  );
}
