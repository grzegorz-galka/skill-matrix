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
  Chip,
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
import { getLevelLabel } from '../utils/levelColors';
import { formatApiError } from '../utils/apiError';
import { useTranslation } from '../i18n/LanguageContext';
import { useAuth } from '../auth/AuthContext';

export function SkillDetailsPage() {
  const { isAdmin } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const skillId = Number(id);
  const isValidId = !isNaN(skillId);

  // Fetch data
  const { skill, loading: skillLoading, error: skillError, refetch: refetchSkill } = useSkill(isValidId ? skillId : null);
  const { skillGrades, loading: gradesLoading, error: gradesError, refetch: refetchGrades } = useSkillGrades(isValidId ? skillId : null);
  const { skillProfiles } = useSkillProfiles();

  // Skill form state
  const [skillFormData, setSkillFormData] = useState<SkillRequest>({
    name: '',
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
    level: 1,
  });

  // Initialize skill form when skill loads
  useEffect(() => {
    if (skill) {
      setSkillFormData({
        name: skill.name,
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
      alert(t.skillDetails.updated);
    } catch (err) {
      alert(formatApiError(err, t, t.skillDetails.updateFailed));
      console.error(err);
    } finally {
      setSkillSaving(false);
    }
  };

  const handleSkillCancel = () => {
    if (skill) {
      setSkillFormData({
        name: skill.name,
        description: skill.description || '',
      });
      setSkillDirty(false);
    }
  };

  // Skill profile handlers
  const handleAddSkillProfile = async (skillProfileId: number) => {
    try {
      await skillService.addSkillProfile(skillId, skillProfileId);
      refetchSkill();
    } catch (err) {
      alert(formatApiError(err, t, t.skillDetails.addProfileFailed));
      console.error(err);
    }
  };

  const handleRemoveSkillProfile = async (skillProfileId: number) => {
    if (confirm(t.skillDetails.removeProfileConfirm)) {
      try {
        await skillService.removeSkillProfile(skillId, skillProfileId);
        refetchSkill();
      } catch (err) {
        alert(formatApiError(err, t, t.skillDetails.removeProfileFailed));
        console.error(err);
      }
    }
  };

  const handleBack = () => {
    if (skillDirty) {
      if (confirm(t.skillDetails.unsavedConfirm)) {
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
      level: 1,
    });
    setShowGradeForm(true);
  };

  const handleGradeEdit = (grade: SkillGrade) => {
    setEditingGrade(grade);
    setGradeFormData({
      skillId: skillId,
      code: grade.code,
      description: grade.description || '',
      level: grade.level,
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
      alert(formatApiError(err, t, t.skillDetails.saveGradeFailed));
      console.error(err);
    }
  };

  const handleGradeDelete = async (grade: SkillGrade) => {
    if (confirm(t.skillDetails.deleteGradeConfirm(grade.code))) {
      try {
        await skillGradeService.delete(grade.id);
        refetchGrades();
      } catch (err) {
        alert(formatApiError(err, t, t.skillDetails.deleteGradeFailed));
        console.error(err);
      }
    }
  };

  const handleGradeCancel = () => {
    setShowGradeForm(false);
  };

  // Checked after all hooks so the hook order is the same on every render
  if (!isValidId) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <ErrorMessage message={t.skillDetails.invalidId} />
        <Button variant="outlined" onClick={() => navigate('/skills')} sx={{ mt: 2 }}>
          {t.skillDetails.backToSkills}
        </Button>
      </Container>
    );
  }

  // Loading state
  if (skillLoading) return <Loading />;

  // Error state
  if (skillError || !skill) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <ErrorMessage
          message={skillError ? formatApiError(skillError, t, t.skillDetails.loadFailed) : t.skillDetails.notFound}
        />
        <Button variant="outlined" onClick={() => navigate('/skills')} sx={{ mt: 2 }}>
          {t.skillDetails.backToSkills}
        </Button>
      </Container>
    );
  }

  const gradeColumns = [
    { key: 'code', header: t.skillDetails.code },
    {
      key: 'level',
      header: t.skillDetails.level,
      render: (grade: SkillGrade) => `L${grade.level}: ${getLevelLabel(grade.level, t)}`,
    },
    { key: 'description', header: t.common.description },
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
          {t.common.back}
        </Button>
        <Typography variant="h4" component="h1">
          {t.skillDetails.title(skill.name)}
        </Typography>
      </Box>

      {/* Skill Information Section */}
      <Paper sx={{ p: 3, mb: 5 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {t.skillDetails.information}
        </Typography>
        <Stack spacing={2}>
          <TextField
            label={t.common.name}
            value={skillFormData.name}
            onChange={(e) => handleSkillChange('name', e.target.value)}
            disabled={skillSaving}
            required
            fullWidth
            variant="outlined"
            size="small"
          />

          {/* Skill Profiles Display */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {t.common.assignedSkillProfiles}:
            </Typography>
            {skill.skillProfiles.length > 0 ? (
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
                {skill.skillProfiles.map(sp => (
                  <Chip
                    key={sp.id}
                    label={sp.name}
                    onDelete={() => handleRemoveSkillProfile(sp.id)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t.common.noSkillProfilesAssigned}
              </Typography>
            )}
          </Box>

          {/* Add Skill Profile Dropdown */}
          <FormControl size="small" sx={{ minWidth: 250 }}>
            <InputLabel>{t.common.addSkillProfile}</InputLabel>
            <Select
              value=""
              label={t.common.addSkillProfile}
              onChange={(e) => handleAddSkillProfile(Number(e.target.value))}
            >
              {skillProfiles
                .filter(sp => !skill.skillProfiles.some(ssp => ssp.id === sp.id))
                .map((profile) => (
                  <MenuItem key={profile.id} value={profile.id}>
                    {profile.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <TextField
            label={t.common.description}
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
              {skillSaving ? t.common.saving : t.common.saveChanges}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleSkillCancel}
              disabled={!skillDirty || skillSaving}
            >
              {t.common.cancel}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Skill Grades Section */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            {t.skillDetails.grades}
          </Typography>
          {isAdmin && (
            <Button variant="contained" color="primary" onClick={handleGradeCreate}>
              {t.skillDetails.addGrade}
            </Button>
          )}
        </Box>

        {/* Grade Form */}
        {showGradeForm && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" component="h3" gutterBottom>
              {editingGrade ? t.skillDetails.editGrade : t.skillDetails.newGrade}
            </Typography>
            <form onSubmit={handleGradeSubmit}>
              <Stack spacing={2}>
                <TextField
                  label={t.skillDetails.code}
                  value={gradeFormData.code}
                  onChange={(e) => setGradeFormData({ ...gradeFormData, code: e.target.value })}
                  required
                  placeholder={t.skillDetails.codePlaceholder}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
                <TextField
                  select
                  label={t.skillDetails.level}
                  value={gradeFormData.level ?? 1}
                  onChange={(e) => setGradeFormData({ ...gradeFormData, level: Number(e.target.value) })}
                  required
                  helperText={t.skillDetails.levelHelper}
                  fullWidth
                  variant="outlined"
                  size="small"
                >
                  {[1, 2, 3, 4, 5].map((level) => (
                    <MenuItem key={level} value={level}>
                      {`L${level}: ${getLevelLabel(level, t)}`}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label={t.common.description}
                  value={gradeFormData.description}
                  onChange={(e) => setGradeFormData({ ...gradeFormData, description: e.target.value })}
                  multiline
                  rows={3}
                  placeholder={t.skillDetails.descriptionPlaceholder}
                  fullWidth
                  variant="outlined"
                />
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Button type="submit" variant="contained" color="success">
                    {t.common.save}
                  </Button>
                  <Button variant="outlined" color="secondary" onClick={handleGradeCancel}>
                    {t.common.cancel}
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Paper>
        )}

        {/* Grades Loading/Error States */}
        {gradesLoading && <Loading />}
        {gradesError != null && (
          <ErrorMessage message={formatApiError(gradesError, t, t.skillDetails.gradesLoadFailed)} />
        )}

        {/* Grades Table */}
        {!gradesLoading && !gradesError && (
          <DataTable
            data={skillGrades}
            columns={gradeColumns}
            onEdit={isAdmin ? handleGradeEdit : undefined}
            onDelete={isAdmin ? handleGradeDelete : undefined}
          />
        )}
      </Box>
    </Container>
  );
}
