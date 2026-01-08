import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Stack,
  Chip,
  FormControl,
  Select,
  MenuItem,
  InputAdornment,
  Avatar,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useEmployees } from '../hooks/useEmployees';
import { useJobProfiles } from '../hooks/useJobProfiles';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { Employee, EmployeeRequest, JobProfile } from '../types';
import { employeeService } from '../services/employeeService';

export function EmployeesPage() {
  const [page] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const { employees, loading, error, refetch } = useEmployees(page, 20, debouncedSearchTerm);
  const { jobProfiles } = useJobProfiles();
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeJobProfiles, setEmployeeJobProfiles] = useState<JobProfile[]>([]);
  const [formData, setFormData] = useState<EmployeeRequest>({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    position: '',
  });

  // Debounce search term to avoid triggering API calls on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch employee job profiles when editing
  useEffect(() => {
    if (editingEmployee) {
      employeeService.getJobProfiles(editingEmployee.id)
        .then(setEmployeeJobProfiles)
        .catch(err => console.error('Failed to fetch employee job profiles:', err));
    } else {
      setEmployeeJobProfiles([]);
    }
  }, [editingEmployee]);

  const handleCreate = () => {
    setEditingEmployee(null);
    setEmployeeJobProfiles([]);
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

  const handleAddJobProfile = async (jobProfileId: number) => {
    if (!editingEmployee) return;

    try {
      await employeeService.assignJobProfile(editingEmployee.id, jobProfileId);
      const updatedProfiles = await employeeService.getJobProfiles(editingEmployee.id);
      setEmployeeJobProfiles(updatedProfiles);
    } catch (err) {
      alert('Failed to assign job profile');
      console.error(err);
    }
  };

  const handleRemoveJobProfile = async (jobProfileId: number) => {
    if (!editingEmployee) return;

    if (confirm('Remove this job profile from the employee?')) {
      try {
        await employeeService.removeJobProfile(editingEmployee.id, jobProfileId);
        const updatedProfiles = await employeeService.getJobProfiles(editingEmployee.id);
        setEmployeeJobProfiles(updatedProfiles);
      } catch (err) {
        alert('Failed to remove job profile');
        console.error(err);
      }
    }
  };

  // Helper function to get initials from name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Helper function to get avatar color
  const getAvatarColor = (name: string) => {
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Page Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: '#3b82f6' }}>
              <PeopleIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                Employees
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your team members and their skills
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            sx={{
              bgcolor: '#2563eb',
              '&:hover': { bgcolor: '#1d4ed8' },
              textTransform: 'none',
              px: 3,
              py: 1,
            }}
          >
            Add Employee
          </Button>
        </Box>

        {/* Two Column Layout */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {/* Left Column - Employee List */}
          <Box sx={{ flex: showForm ? '1 1 calc(50% - 12px)' : '1 1 100%', minWidth: 0 }}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              {/* List Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PeopleIcon sx={{ color: '#6b7280' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    All Employees
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {employees?.totalElements || 0} employees
                </Typography>
              </Box>

              {/* Search Bar */}
              <TextField
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                variant="outlined"
                size="small"
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#9ca3af' }} />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Employee Cards */}
              <Stack spacing={2}>
                {employees?.content.map((employee) => (
                  <Paper
                    key={employee.id}
                    sx={{
                      p: 2,
                      border: '1px solid #e5e7eb',
                      borderRadius: 2,
                      '&:hover': { boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: getAvatarColor(employee.firstName),
                          width: 48,
                          height: 48,
                          fontSize: '1rem',
                          fontWeight: 'bold',
                        }}
                      >
                        {getInitials(employee.firstName, employee.lastName)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                          {employee.firstName} {employee.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {employee.position || 'No position'}
                        </Typography>
                        <Stack direction="row" spacing={2} sx={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <EmailIcon sx={{ fontSize: 16 }} />
                            <Typography variant="body2">{employee.email}</Typography>
                          </Box>
                          {employee.department && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <BusinessIcon sx={{ fontSize: 16 }} />
                              <Typography variant="body2">{employee.department}</Typography>
                            </Box>
                          )}
                        </Stack>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(employee)}
                          sx={{ color: '#2563eb' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(employee)}
                          sx={{ color: '#ef4444' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Box>
                  </Paper>
                ))}
              </Stack>

              {/* Pagination */}
              {employees && (
                <Typography variant="body2" align="center" sx={{ mt: 3, color: '#6b7280' }}>
                  Page {employees.page + 1} of {employees.totalPages} (Total: {employees.totalElements} employees)
                </Typography>
              )}
            </Paper>
          </Box>

          {/* Right Column - Edit Form */}
          {showForm && (
            <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: 0 }}>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                {/* Form Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <EditIcon sx={{ color: '#2563eb' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {editingEmployee ? 'Edit Employee' : 'New Employee'}
                  </Typography>
                </Box>

                <form onSubmit={handleSubmit}>
                  <Stack spacing={2.5}>
                    {/* First Name */}
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PersonIcon sx={{ fontSize: 16 }} />
                        First Name *
                      </Typography>
                      <TextField
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Enter first name"
                      />
                    </Box>

                    {/* Last Name */}
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PersonIcon sx={{ fontSize: 16 }} />
                        Last Name *
                      </Typography>
                      <TextField
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Enter last name"
                      />
                    </Box>

                    {/* Email */}
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <EmailIcon sx={{ fontSize: 16 }} />
                        Email *
                      </Typography>
                      <TextField
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Enter email address"
                      />
                    </Box>

                    {/* Department */}
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <BusinessIcon sx={{ fontSize: 16 }} />
                        Department
                      </Typography>
                      <TextField
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Enter department"
                      />
                    </Box>

                    {/* Position */}
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <WorkIcon sx={{ fontSize: 16 }} />
                        Position
                      </Typography>
                      <TextField
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Enter position"
                      />
                    </Box>

                    {/* Job Profiles Section - Always show */}
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500 }}>
                        Assigned Job Profiles:
                      </Typography>
                      {editingEmployee && employeeJobProfiles.length > 0 ? (
                        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                          {employeeJobProfiles.map(jp => (
                            <Chip
                              key={jp.id}
                              label={jp.name}
                              onDelete={() => handleRemoveJobProfile(jp.id)}
                              sx={{
                                bgcolor: '#dbeafe',
                                color: '#1e40af',
                                '& .MuiChip-deleteIcon': { color: '#1e40af' },
                              }}
                            />
                          ))}
                        </Stack>
                      ) : editingEmployee ? (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          No job profiles assigned
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Save employee first to assign job profiles
                        </Typography>
                      )}

                      {/* Add Job Profile Button */}
                      {editingEmployee && (
                        <Paper
                          variant="outlined"
                          sx={{
                            border: '2px dashed #cbd5e1',
                            p: 2,
                            textAlign: 'center',
                            cursor: 'pointer',
                            '&:hover': { borderColor: '#2563eb', bgcolor: '#f8fafc' },
                          }}
                        >
                          <FormControl fullWidth size="small">
                            <Select
                              displayEmpty
                              value=""
                              onChange={(e) => handleAddJobProfile(Number(e.target.value))}
                              renderValue={() => (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#6b7280' }}>
                                  <AddIcon fontSize="small" />
                                  <span>Add Job Profile</span>
                                </Box>
                              )}
                              sx={{ border: 'none', '& fieldset': { border: 'none' } }}
                            >
                              {jobProfiles
                                .filter(jp => !employeeJobProfiles.some(ejp => ejp.id === jp.id))
                                .map((profile) => (
                                  <MenuItem key={profile.id} value={profile.id}>
                                    {profile.name}
                                  </MenuItem>
                                ))}
                            </Select>
                          </FormControl>
                        </Paper>
                      )}
                    </Box>

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{
                          bgcolor: '#10b981',
                          '&:hover': { bgcolor: '#059669' },
                          textTransform: 'none',
                          py: 1.5,
                          fontWeight: 'bold',
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => setShowForm(false)}
                        sx={{
                          borderColor: '#d1d5db',
                          color: '#6b7280',
                          '&:hover': { borderColor: '#9ca3af', bgcolor: '#f9fafb' },
                          textTransform: 'none',
                          py: 1.5,
                          fontWeight: 'bold',
                        }}
                      >
                        Cancel
                      </Button>
                    </Stack>
                  </Stack>
                </form>
              </Paper>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}
