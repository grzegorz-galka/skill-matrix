import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSkill } from '../hooks/useSkills';
import { useSkillGrades } from '../hooks/useSkillGrades';
import { useSkillProfiles } from '../hooks/useSkillProfiles';
import { DataTable } from '../components/DataTable';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { SkillRequest, SkillGrade, SkillGradeRequest } from '../types';
import { skillService } from '../services/skillService';
import { skillGradeService } from '../services/skillGradeService';

export function SkillDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const skillId = Number(id);

  // Validate skill ID
  if (isNaN(skillId)) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <ErrorMessage message="Invalid skill ID" />
        <Button variant="outlined" onClick={() => navigate('/skills')} sx={{ mt: 2 }}>
          Back to Skills
        </Button>
      </Container>
    );
  }

  // Fetch data
  const { skill, loading: skillLoading, error: skillError } = useSkill(skillId);
  const { skillGrades, loading: gradesLoading, error: gradesError, refetch: refetchGrades } = useSkillGrades(skillId);
  const { skillProfiles } = useSkillProfiles();

  // Skill form state
  const [skillFormData, setSkillFormData] = useState<SkillRequest>({
    name: '',
    skillProfileId: 0,
    description: '',
  });
  const [skillDirty, setSkillDirty] = useState(false);
  const [skillSaving, setSkillSaving] = useState(false);

  // Grade form state
  const [showGradeForm, setShowGradeForm] = useState(false);
  const [editingGrade, setEditingGrade] = useState<SkillGrade | null>(null);
  const [gradeFormData, setGradeFormData] = useState<SkillGradeRequest>({
    skillId: skillId,
    code: '',
    description: '',
  });

  // Initialize skill form when skill loads
  useEffect(() => {
    if (skill) {
      setSkillFormData({
        name: skill.name,
        skillProfileId: skill.skillProfileId,
        description: skill.description || '',
      });
    }
  }, [skill]);

  // Warn on browser close with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (skillDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [skillDirty]);

  // Skill handlers
  const handleSkillChange = (field: keyof SkillRequest, value: string | number) => {
    setSkillFormData({ ...skillFormData, [field]: value });
    setSkillDirty(true);
  };

  const handleSkillSave = async () => {
    try {
      setSkillSaving(true);
      await skillService.update(skillId, skillFormData);
      setSkillDirty(false);
      alert('Skill updated successfully');
    } catch (err) {
      alert('Failed to update skill');
      console.error(err);
    } finally {
      setSkillSaving(false);
    }
  };

  const handleSkillCancel = () => {
    if (skill) {
      setSkillFormData({
        name: skill.name,
        skillProfileId: skill.skillProfileId,
        description: skill.description || '',
      });
      setSkillDirty(false);
    }
  };

  const handleBack = () => {
    if (skillDirty) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/skills');
      }
    } else {
      navigate('/skills');
    }
  };

  // Grade handlers
  const handleGradeCreate = () => {
    setEditingGrade(null);
    setGradeFormData({
      skillId: skillId,
      code: '',
      description: '',
    });
    setShowGradeForm(true);
  };

  const handleGradeEdit = (grade: SkillGrade) => {
    setEditingGrade(grade);
    setGradeFormData({
      skillId: skillId,
      code: grade.code,
      description: grade.description || '',
    });
    setShowGradeForm(true);
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGrade) {
        await skillGradeService.update(editingGrade.id, gradeFormData);
      } else {
        await skillGradeService.create(gradeFormData);
      }
      setShowGradeForm(false);
      refetchGrades();
    } catch (err) {
      alert('Failed to save skill grade');
      console.error(err);
    }
  };

  const handleGradeDelete = async (grade: SkillGrade) => {
    if (confirm(`Delete grade "${grade.code}"?`)) {
      try {
        await skillGradeService.delete(grade.id);
        refetchGrades();
      } catch (err) {
        alert('Failed to delete skill grade');
        console.error(err);
      }
    }
  };

  const handleGradeCancel = () => {
    setShowGradeForm(false);
  };

  // Loading state
  if (skillLoading) return <Loading />;

  // Error state
  if (skillError || !skill) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <ErrorMessage message={skillError || 'Skill not found'} />
        <Button variant="outlined" onClick={() => navigate('/skills')} sx={{ mt: 2 }}>
          Back to Skills
        </Button>
      </Container>
    );
  }

  const gradeColumns = [
    { key: 'code', header: 'Code' },
    { key: 'description', header: 'Description' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          Skill: {skill.name}
        </Typography>
      </Box>

      {/* Skill Information Section */}
      <Paper sx={{ p: 3, mb: 5 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Skill Information
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="Name"
            value={skillFormData.name}
            onChange={(e) => handleSkillChange('name', e.target.value)}
            disabled={skillSaving}
            required
            fullWidth
            variant="outlined"
            size="small"
          />
          <FormControl fullWidth variant="outlined" size="small" required>
            <InputLabel>Skill Profile</InputLabel>
            <Select
              label="Skill Profile"
              value={skillFormData.skillProfileId}
              onChange={(e) => handleSkillChange('skillProfileId', Number(e.target.value))}
              disabled={skillSaving}
            >
              <option value={0}>Select a skill profile</option>
              {skillProfiles.map((profile) => (
                <MenuItem key={profile.id} value={profile.id}>
                  {profile.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Description"
            value={skillFormData.description}
            onChange={(e) => handleSkillChange('description', e.target.value)}
            disabled={skillSaving}
            multiline
            rows={3}
            fullWidth
            variant="outlined"
          />
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color={skillDirty && !skillSaving ? 'success' : 'inherit'}
              onClick={handleSkillSave}
              disabled={!skillDirty || skillSaving}
            >
              {skillSaving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleSkillCancel}
              disabled={!skillDirty || skillSaving}
            >
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Skill Grades Section */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            Skill Grades
          </Typography>
          <Button variant="contained" color="primary" onClick={handleGradeCreate}>
            Add Grade
          </Button>
        </Box>

        {/* Grade Form */}
        {showGradeForm && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" component="h3" gutterBottom>
              {editingGrade ? 'Edit Grade' : 'New Grade'}
            </Typography>
            <form onSubmit={handleGradeSubmit}>
              <Stack spacing={2}>
                <TextField
                  label="Code"
                  value={gradeFormData.code}
                  onChange={(e) => setGradeFormData({ ...gradeFormData, code: e.target.value })}
                  required
                  placeholder="e.g., beginner, intermediate, advanced, expert"
                  fullWidth
                  variant="outlined"
                  size="small"
                />
                <TextField
                  label="Description"
                  value={gradeFormData.description}
                  onChange={(e) => setGradeFormData({ ...gradeFormData, description: e.target.value })}
                  multiline
                  rows={3}
                  placeholder="Describe what this grade level means"
                  fullWidth
                  variant="outlined"
                />
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Button type="submit" variant="contained" color="success">
                    Save
                  </Button>
                  <Button variant="outlined" color="secondary" onClick={handleGradeCancel}>
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Paper>
        )}

        {/* Grades Loading/Error States */}
        {gradesLoading && <Loading />}
        {gradesError && <ErrorMessage message={gradesError} />}

        {/* Grades Table */}
        {!gradesLoading && !gradesError && (
          <DataTable
            data={skillGrades}
            columns={gradeColumns}
            onEdit={handleGradeEdit}
            onDelete={handleGradeDelete}
          />
        )}
      </Box>
    </Container>
  );
}
