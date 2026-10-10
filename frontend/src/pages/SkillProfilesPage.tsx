import { useState } from 'react';
import { Container, Box, Typography, Button, Paper, TextField, Stack } from '@mui/material';
import { useSkillProfiles } from '../hooks/useSkillProfiles';
import { DataTable } from '../components/DataTable';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { SkillProfile, SkillProfileRequest } from '../types';
import { skillProfileService } from '../services/skillProfileService';
import { formatApiError } from '../utils/apiError';
import { useTranslation } from '../i18n/LanguageContext';
import { useAuth } from '../auth/AuthContext';

export function SkillProfilesPage() {
  const { isAdmin } = useAuth();
  const { t } = useTranslation();
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
    if (confirm(t.skillProfiles.deleteConfirm(profile.name))) {
      try {
        await skillProfileService.delete(profile.id);
        refetch();
      } catch (err) {
        alert(formatApiError(err, t, t.skillProfiles.deleteFailed));
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
      alert(formatApiError(err, t, t.skillProfiles.saveFailed));
    }
  };

  const columns = [
    { key: 'name', header: t.common.name },
    { key: 'description', header: t.common.description },
  ];

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={formatApiError(error, t, t.skillProfiles.loadFailed)} />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {t.skillProfiles.title}
        </Typography>
        {isAdmin && (
          <Button variant="contained" color="primary" onClick={handleCreate}>
            {t.skillProfiles.add}
          </Button>
        )}
      </Box>

      {showForm && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            {editingProfile ? t.skillProfiles.editTitle : t.skillProfiles.newTitle}
          </Typography>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label={t.common.name}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                fullWidth
                variant="outlined"
                size="small"
              />
              <TextField
                label={t.common.description}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
                fullWidth
                variant="outlined"
              />
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button type="submit" variant="contained" color="success">
                  {t.common.save}
                </Button>
                <Button variant="outlined" color="secondary" onClick={() => setShowForm(false)}>
                  {t.common.cancel}
                </Button>
              </Stack>
            </Stack>
          </form>
        </Paper>
      )}

      <DataTable
        data={skillProfiles}
        columns={columns}
        onEdit={isAdmin ? handleEdit : undefined}
        onDelete={isAdmin ? handleDelete : undefined}
      />
    </Container>
  );
}
