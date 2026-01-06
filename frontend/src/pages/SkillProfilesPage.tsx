import { useState } from 'react';
import { Container, Box, Typography, Button, Paper, TextField, Stack } from '@mui/material';
import { useSkillProfiles } from '../hooks/useSkillProfiles';
import { DataTable } from '../components/DataTable';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { SkillProfile, SkillProfileRequest } from '../types';
import { skillProfileService } from '../services/skillProfileService';

export function SkillProfilesPage() {
  const { skillProfiles, loading, error, refetch } = useSkillProfiles();
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<SkillProfile | null>(null);
  const [formData, setFormData] = useState<SkillProfileRequest>({
    name: '',
    description: '',
  });

  const handleCreate = () => {
    setEditingProfile(null);
    setFormData({ name: '', description: '' });
    setShowForm(true);
  };

  const handleEdit = (profile: SkillProfile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      description: profile.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (profile: SkillProfile) => {
    if (confirm(`Delete skill profile ${profile.name}?`)) {
      try {
        await skillProfileService.delete(profile.id);
        refetch();
      } catch (err) {
        alert('Failed to delete skill profile');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProfile) {
        await skillProfileService.update(editingProfile.id, formData);
      } else {
        await skillProfileService.create(formData);
      }
      setShowForm(false);
      refetch();
    } catch (err) {
      alert('Failed to save skill profile');
    }
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'description', header: 'Description' },
  ];

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Skill Profiles
        </Typography>
        <Button variant="contained" color="primary" onClick={handleCreate}>
          Add Skill Profile
        </Button>
      </Box>

      {showForm && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            {editingProfile ? 'Edit Skill Profile' : 'New Skill Profile'}
          </Typography>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                fullWidth
                variant="outlined"
                size="small"
              />
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
                fullWidth
                variant="outlined"
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

      <DataTable
        data={skillProfiles}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </Container>
  );
}
