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
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { Skill, SkillRequest, SkillProfile, SkillGrade, SkillGradeRequest } from '../types';
import { skillService } from '../services/skillService';
import { skillGradeService } from '../services/skillGradeService';
import { getLevelColor, getLevelTextColor, getLevelLabel } from '../utils/levelColors';

interface SkillEditModalProps {
  open: boolean;
  skill: Skill | null;
  skillProfiles: SkillProfile[];
  onClose: () => void;
  onSave: () => void;
}

export function SkillEditModal({ open, skill, skillProfiles, onClose, onSave }: SkillEditModalProps) {
  const [formData, setFormData] = useState<SkillRequest>({
    name: '',
    description: '',
  });
  const [skillSkillProfiles, setSkillSkillProfiles] = useState<SkillProfile[]>([]);
  const [skillGrades, setSkillGrades] = useState<SkillGrade[]>([]);
  const [newGrade, setNewGrade] = useState({ code: '', description: '', level: 1 });
  const [editingGrade, setEditingGrade] = useState<SkillGrade | null>(null);

  useEffect(() => {
    if (skill) {
      setFormData({
        name: skill.name,
        description: skill.description || '',
      });
      setSkillSkillProfiles(skill.skillProfiles || []);
      setSkillGrades(skill.grades || []);
    } else {
      setFormData({ name: '', description: '' });
      setSkillSkillProfiles([]);
      setSkillGrades([]);
    }
    setNewGrade({ code: '', description: '', level: 1 });
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

  const handleAddSkillProfile = async (skillProfileId: number) => {
    if (!skill) return;

    try {
      await skillService.addSkillProfile(skill.id, skillProfileId);
      const updatedProfiles = await skillService.getSkillProfiles(skill.id);
      setSkillSkillProfiles(updatedProfiles);
    } catch (err) {
      alert('Failed to assign skill profile');
    }
  };

  const handleRemoveSkillProfile = async (skillProfileId: number) => {
    if (!skill) return;

    try {
      await skillService.removeSkillProfile(skill.id, skillProfileId);
      const updatedProfiles = await skillService.getSkillProfiles(skill.id);
      setSkillSkillProfiles(updatedProfiles);
    } catch (err) {
      alert('Failed to remove skill profile');
    }
  };

  const handleAddGrade = async () => {
    if (!skill || !newGrade.code) return;

    try {
      const gradeRequest: SkillGradeRequest = {
        skillId: skill.id,
        code: newGrade.code,
        description: newGrade.description,
        level: newGrade.level,
      };
      await skillGradeService.create(gradeRequest);
      const updatedGrades = await skillGradeService.getBySkillId(skill.id);
      setSkillGrades(updatedGrades);
      setNewGrade({ code: '', description: '', level: 1 });
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
        level: editingGrade.level,
      };
      await skillGradeService.update(editingGrade.id, gradeRequest);
      const updatedGrades = await skillGradeService.getBySkillId(skill.id);
      setSkillGrades(updatedGrades);
      setEditingGrade(null);
    } catch (err) {
      alert('Failed to update grade');
    }
  };

  const handleMoveGradeUp = async (grade: SkillGrade) => {
    if (!skill || grade.level <= 1) return;
    try {
      const gradeRequest: SkillGradeRequest = {
        skillId: skill.id,
        code: grade.code,
        description: grade.description,
        level: grade.level - 1,
      };
      await skillGradeService.update(grade.id, gradeRequest);
      const updatedGrades = await skillGradeService.getBySkillId(skill.id);
      setSkillGrades(updatedGrades);
    } catch (err) {
      alert('Failed to update grade level');
    }
  };

  const handleMoveGradeDown = async (grade: SkillGrade) => {
    if (!skill || grade.level >= 5) return;
    try {
      const gradeRequest: SkillGradeRequest = {
        skillId: skill.id,
        code: grade.code,
        description: grade.description,
        level: grade.level + 1,
      };
      await skillGradeService.update(grade.id, gradeRequest);
      const updatedGrades = await skillGradeService.getBySkillId(skill.id);
      setSkillGrades(updatedGrades);
    } catch (err) {
      alert('Failed to update grade level');
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
                Update skill information and associated skill profiles
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

          {/* Assigned Skill Profiles Section */}
          <Box sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
              Assigned Skill Profiles
            </Typography>

            {skill && skillSkillProfiles.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                {skillSkillProfiles.map((sp) => (
                  <Chip
                    key={sp.id}
                    label={sp.name}
                    onDelete={() => handleRemoveSkillProfile(sp.id)}
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
                    onChange={(e) => handleAddSkillProfile(Number(e.target.value))}
                    renderValue={() => (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#6b7280' }}>
                        <AddIcon fontSize="small" />
                        <span>Select a skill profile...</span>
                      </Box>
                    )}
                    sx={{ border: 'none', '& fieldset': { border: 'none' } }}
                  >
                    {skillProfiles
                      .filter((sp) => !skillSkillProfiles.some((ssp) => ssp.id === sp.id))
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
                Save skill first to assign skill profiles
              </Typography>
            )}
          </Box>

          <Divider />

          {/* Skill Grades Section */}
          <Box sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Skill Grades
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Grades are ordered by level (1=Beginner to 5=Expert). Use arrows to change level.
            </Typography>

            {skill && skillGrades.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {[...skillGrades]
                  .sort((a, b) => a.level - b.level)
                  .map((grade) => (
                    <Box
                      key={grade.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: getLevelColor(grade.level),
                        borderRadius: 2,
                        overflow: 'hidden',
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleMoveGradeUp(grade)}
                        disabled={grade.level <= 1}
                        sx={{
                          color: getLevelTextColor(grade.level),
                          opacity: grade.level <= 1 ? 0.3 : 1,
                          p: 0.5,
                        }}
                      >
                        <ArrowUpwardIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                      <Chip
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                              L{grade.level}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {grade.code}
                            </Typography>
                          </Box>
                        }
                        onClick={() => setEditingGrade(grade)}
                        onDelete={() => handleDeleteGrade(grade.id)}
                        sx={{
                          bgcolor: 'transparent',
                          color: getLevelTextColor(grade.level),
                          '& .MuiChip-deleteIcon': {
                            color: getLevelTextColor(grade.level),
                          },
                          borderRadius: 0,
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleMoveGradeDown(grade)}
                        disabled={grade.level >= 5}
                        sx={{
                          color: getLevelTextColor(grade.level),
                          opacity: grade.level >= 5 ? 0.3 : 1,
                          p: 0.5,
                        }}
                      >
                        <ArrowDownwardIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  ))}
              </Box>
            )}

            {skill ? (
              <Box>
                <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
                  <TextField
                    label="Code"
                    value={editingGrade ? editingGrade.code : newGrade.code}
                    onChange={(e) =>
                      editingGrade
                        ? setEditingGrade({ ...editingGrade, code: e.target.value })
                        : setNewGrade({ ...newGrade, code: e.target.value })
                    }
                    size="small"
                    sx={{ flex: '1 1 100px', minWidth: 100 }}
                  />
                  <TextField
                    label="Description"
                    value={editingGrade ? editingGrade.description || '' : newGrade.description}
                    onChange={(e) =>
                      editingGrade
                        ? setEditingGrade({ ...editingGrade, description: e.target.value })
                        : setNewGrade({ ...newGrade, description: e.target.value })
                    }
                    size="small"
                    sx={{ flex: '2 1 150px', minWidth: 150 }}
                  />
                  <FormControl size="small" sx={{ minWidth: 130 }}>
                    <Select
                      value={editingGrade ? editingGrade.level : newGrade.level}
                      onChange={(e) =>
                        editingGrade
                          ? setEditingGrade({ ...editingGrade, level: Number(e.target.value) })
                          : setNewGrade({ ...newGrade, level: Number(e.target.value) })
                      }
                      renderValue={(value) => (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              borderRadius: 0.5,
                              bgcolor: getLevelColor(value as number),
                            }}
                          />
                          <span>L{value} - {getLevelLabel(value as number)}</span>
                        </Box>
                      )}
                    >
                      {[1, 2, 3, 4, 5].map((level) => (
                        <MenuItem key={level} value={level}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 16,
                                height: 16,
                                borderRadius: 0.5,
                                bgcolor: getLevelColor(level),
                              }}
                            />
                            <span>L{level} - {getLevelLabel(level)}</span>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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
