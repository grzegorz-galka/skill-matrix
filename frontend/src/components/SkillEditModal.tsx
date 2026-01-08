import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Chip,
  IconButton,
  Paper,
  FormControl,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { Skill, SkillRequest, JobProfile, SkillGrade, SkillGradeRequest } from '../types';
import { skillService } from '../services/skillService';
import { skillGradeService } from '../services/skillGradeService';

interface SkillEditModalProps {
  open: boolean;
  skill: Skill | null;
  jobProfiles: JobProfile[];
  onClose: () => void;
  onSave: () => void;
}

export function SkillEditModal({ open, skill, jobProfiles, onClose, onSave }: SkillEditModalProps) {
  const [formData, setFormData] = useState<SkillRequest>({
    name: '',
    description: '',
  });
  const [skillJobProfiles, setSkillJobProfiles] = useState<JobProfile[]>([]);
  const [skillGrades, setSkillGrades] = useState<SkillGrade[]>([]);
  const [newGrade, setNewGrade] = useState({ code: '', description: '' });
  const [editingGrade, setEditingGrade] = useState<SkillGrade | null>(null);

  useEffect(() => {
    if (skill) {
      setFormData({
        name: skill.name,
        description: skill.description || '',
      });
      setSkillJobProfiles(skill.jobProfiles || []);
      setSkillGrades(skill.grades || []);
    } else {
      setFormData({ name: '', description: '' });
      setSkillJobProfiles([]);
      setSkillGrades([]);
    }
    setNewGrade({ code: '', description: '' });
    setEditingGrade(null);
  }, [skill]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (skill) {
        await skillService.update(skill.id, formData);
      } else {
        await skillService.create(formData);
      }
      onSave();
      onClose();
    } catch (err) {
      alert('Failed to save skill');
    }
  };

  const handleAddJobProfile = async (jobProfileId: number) => {
    if (!skill) return;

    try {
      await skillService.addJobProfile(skill.id, jobProfileId);
      const updatedProfiles = await skillService.getJobProfiles(skill.id);
      setSkillJobProfiles(updatedProfiles);
    } catch (err) {
      alert('Failed to assign job profile');
    }
  };

  const handleRemoveJobProfile = async (jobProfileId: number) => {
    if (!skill) return;

    try {
      await skillService.removeJobProfile(skill.id, jobProfileId);
      const updatedProfiles = await skillService.getJobProfiles(skill.id);
      setSkillJobProfiles(updatedProfiles);
    } catch (err) {
      alert('Failed to remove job profile');
    }
  };

  const handleAddGrade = async () => {
    if (!skill || !newGrade.code) return;

    try {
      const gradeRequest: SkillGradeRequest = {
        skillId: skill.id,
        code: newGrade.code,
        description: newGrade.description,
      };
      await skillGradeService.create(gradeRequest);
      const updatedGrades = await skillGradeService.getBySkillId(skill.id);
      setSkillGrades(updatedGrades);
      setNewGrade({ code: '', description: '' });
    } catch (err) {
      alert('Failed to add grade');
    }
  };

  const handleUpdateGrade = async () => {
    if (!editingGrade || !skill) return;

    try {
      const gradeRequest: SkillGradeRequest = {
        skillId: skill.id,
        code: editingGrade.code,
        description: editingGrade.description,
      };
      await skillGradeService.update(editingGrade.id, gradeRequest);
      const updatedGrades = await skillGradeService.getBySkillId(skill.id);
      setSkillGrades(updatedGrades);
      setEditingGrade(null);
    } catch (err) {
      alert('Failed to update grade');
    }
  };

  const handleDeleteGrade = async (gradeId: number) => {
    if (!skill) return;

    if (confirm('Delete this grade?')) {
      try {
        await skillGradeService.delete(gradeId);
        const updatedGrades = await skillGradeService.getBySkillId(skill.id);
        setSkillGrades(updatedGrades);
      } catch (err) {
        alert('Failed to delete grade');
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <Box sx={{ p: 3, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                Edit Skill: {skill?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Update skill information and associated job profiles
              </Typography>
            </Box>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider />

          {/* Skill Information Section */}
          <Box sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
              Skill Information
            </Typography>

            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Name *
                </Typography>
                <TextField
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter skill name"
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Description
                </Typography>
                <TextField
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  multiline
                  rows={3}
                  fullWidth
                  variant="outlined"
                  placeholder="Enter skill description"
                />
              </Box>
            </Stack>
          </Box>

          <Divider />

          {/* Assigned Job Profiles Section */}
          <Box sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
              Assigned Job Profiles
            </Typography>

            {skill && skillJobProfiles.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                {skillJobProfiles.map((jp) => (
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
            )}

            {skill ? (
              <Paper
                variant="outlined"
                sx={{
                  border: '2px dashed #cbd5e1',
                  p: 1.5,
                  textAlign: 'center',
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
                        <span>Select a job profile...</span>
                      </Box>
                    )}
                    sx={{ border: 'none', '& fieldset': { border: 'none' } }}
                  >
                    {jobProfiles
                      .filter((jp) => !skillJobProfiles.some((sjp) => sjp.id === jp.id))
                      .map((profile) => (
                        <MenuItem key={profile.id} value={profile.id}>
                          {profile.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Paper>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Save skill first to assign job profiles
              </Typography>
            )}
          </Box>

          <Divider />

          {/* Skill Grades Section */}
          <Box sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
              Skill Grades
            </Typography>

            {skill && skillGrades.length > 0 && (
              <Stack spacing={1} sx={{ mb: 2 }}>
                {skillGrades.map((grade, index) => (
                  <Chip
                    key={grade.id}
                    label={`${index + 1}: ${grade.code}${grade.description ? ` (${grade.description})` : ''}`}
                    icon={
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: '#3b82f6',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                        }}
                      >
                        {index + 1}
                      </Box>
                    }
                    onDelete={() => handleDeleteGrade(grade.id)}
                    onClick={() => setEditingGrade(grade)}
                    sx={{
                      bgcolor: '#3b82f6',
                      color: 'white',
                      '& .MuiChip-deleteIcon': { color: 'white' },
                      justifyContent: 'space-between',
                    }}
                  />
                ))}
              </Stack>
            )}

            {skill ? (
              <Box>
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Code"
                    value={editingGrade ? editingGrade.code : newGrade.code}
                    onChange={(e) =>
                      editingGrade
                        ? setEditingGrade({ ...editingGrade, code: e.target.value })
                        : setNewGrade({ ...newGrade, code: e.target.value })
                    }
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Description"
                    value={editingGrade ? editingGrade.description : newGrade.description}
                    onChange={(e) =>
                      editingGrade
                        ? setEditingGrade({ ...editingGrade, description: e.target.value })
                        : setNewGrade({ ...newGrade, description: e.target.value })
                    }
                    size="small"
                    sx={{ flex: 2 }}
                  />
                  <Button
                    variant="contained"
                    onClick={editingGrade ? handleUpdateGrade : handleAddGrade}
                    sx={{
                      bgcolor: '#3b82f6',
                      '&:hover': { bgcolor: '#2563eb' },
                      textTransform: 'none',
                    }}
                  >
                    {editingGrade ? 'Update' : 'Add Grade'}
                  </Button>
                </Stack>
                {editingGrade && (
                  <Button
                    size="small"
                    onClick={() => setEditingGrade(null)}
                    sx={{ mt: 1, textTransform: 'none' }}
                  >
                    Cancel Edit
                  </Button>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Save skill first to add grades
              </Typography>
            )}
          </Box>

          <Divider />

          {/* Action Buttons */}
          <Box sx={{ p: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{
                borderColor: '#d1d5db',
                color: '#6b7280',
                '&:hover': { borderColor: '#9ca3af', bgcolor: '#f9fafb' },
                textTransform: 'none',
                px: 3,
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                bgcolor: '#8b5cf6',
                '&:hover': { bgcolor: '#7c3aed' },
                textTransform: 'none',
                px: 3,
              }}
            >
              Save Changes
            </Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
}
