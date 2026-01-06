import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useSkills } from '../hooks/useSkills';
import { useSkillProfiles } from '../hooks/useSkillProfiles';
import { DataTable } from '../components/DataTable';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { Skill, SkillRequest } from '../types';
import { skillService } from '../services/skillService';

export function SkillsPage() {
  const navigate = useNavigate();
  const { skills, loading, error, refetch } = useSkills();
  const { skillProfiles } = useSkillProfiles();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<SkillRequest>({
    name: '',
    skillProfileId: 0,
    description: '',
  });

  const handleCreate = () => {
    setFormData({ name: '', skillProfileId: 0, description: '' });
    setShowForm(true);
  };

  const handleEdit = (skill: Skill) => {
    navigate(`/skills/${skill.id}`);
  };

  const handleDelete = async (skill: Skill) => {
    if (confirm(`Delete skill ${skill.name}?`)) {
      try {
        await skillService.delete(skill.id);
        refetch();
      } catch (err) {
        alert('Failed to delete skill');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await skillService.create(formData);
      setShowForm(false);
      refetch();
    } catch (err) {
      alert('Failed to save skill');
    }
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'skillProfileName', header: 'Skill Profile' },
    { key: 'description', header: 'Description' },
  ];

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Skills
        </Typography>
        <Button variant="contained" color="primary" onClick={handleCreate}>
          Add Skill
        </Button>
      </Box>

      {showForm && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            New Skill
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
              <FormControl fullWidth variant="outlined" size="small" required>
                <InputLabel>Skill Profile</InputLabel>
                <Select
                  label="Skill Profile"
                  value={formData.skillProfileId}
                  onChange={(e) => setFormData({ ...formData, skillProfileId: Number(e.target.value) })}
                >
                  <MenuItem value={0}>Select a skill profile</MenuItem>
                  {skillProfiles.map((profile) => (
                    <MenuItem key={profile.id} value={profile.id}>
                      {profile.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
        data={skills}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </Container>
  );
}
