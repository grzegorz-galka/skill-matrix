import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Avatar,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SchoolIcon from '@mui/icons-material/School';
import { useSkills } from '../hooks/useSkills';
import { useSkillProfiles } from '../hooks/useSkillProfiles';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { SkillEditModal } from '../components/SkillEditModal';
import { Skill } from '../types';
import { skillService } from '../services/skillService';
import { getLevelColor, getLevelTextColor } from '../utils/levelColors';
import { formatApiError } from '../utils/apiError';
import { useTranslation } from '../i18n/LanguageContext';
import { useAuth } from '../auth/AuthContext';

export function SkillsPage() {
  const { isAdmin } = useAuth();
  const { t } = useTranslation();
  const [page] = useState(0);
  const { skills, loading, error, refetch } = useSkills(page, 20);
  const { skillProfiles } = useSkillProfiles();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const handleCreate = () => {
    setSelectedSkill(null);
    setModalOpen(true);
  };

  const handleEdit = (skill: Skill) => {
    setSelectedSkill(skill);
    setModalOpen(true);
  };

  const handleDelete = async (skill: Skill) => {
    if (confirm(t.skills.deleteConfirm(skill.name))) {
      try {
        await skillService.delete(skill.id);
        refetch();
      } catch (err) {
        alert(formatApiError(err, t, t.skills.deleteFailed));
      }
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedSkill(null);
  };

  const handleModalSave = () => {
    refetch();
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={formatApiError(error, t, t.skills.loadFailed)} />;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Page Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: '#8b5cf6' }}>
              <SchoolIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {t.skills.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t.skills.subtitle}
              </Typography>
            </Box>
          </Box>
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
              sx={{
                bgcolor: '#8b5cf6',
                '&:hover': { bgcolor: '#7c3aed' },
                textTransform: 'none',
                px: 3,
                py: 1,
              }}
            >
              {t.skills.add}
            </Button>
          )}
        </Box>

        {/* Skills Table */}
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f9fafb' }}>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>{t.common.name}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>{t.skills.skillProfiles}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>{t.common.description}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>{t.skills.grades}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2, textAlign: 'right' }}>{t.common.actions}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(skills?.content || []).map((skill) => (
                  <TableRow
                    key={skill.id}
                    sx={{
                      '&:hover': { bgcolor: '#f9fafb' },
                      borderBottom: '1px solid #e5e7eb',
                    }}
                  >
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {skill.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                        {skill.skillProfiles?.length > 0 ? (
                          skill.skillProfiles.map((sp) => (
                            <Chip
                              key={sp.id}
                              label={sp.name}
                              size="small"
                              sx={{
                                bgcolor: '#dbeafe',
                                color: '#1e40af',
                                fontSize: '0.75rem',
                                height: 24,
                              }}
                            />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            {t.common.none}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {skill.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                        {skill.grades?.length > 0 ? (
                          [...skill.grades]
                            .sort((a, b) => a.level - b.level)
                            .map((grade) => (
                              <Chip
                                key={grade.id}
                                label={grade.code}
                                size="small"
                                sx={{
                                  bgcolor: getLevelColor(grade.level),
                                  color: getLevelTextColor(grade.level),
                                  fontSize: '0.7rem',
                                  fontWeight: 'bold',
                                  height: 24,
                                }}
                              />
                            ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ py: 2, textAlign: 'right' }}>
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {isAdmin && (
                          <>
                            <IconButton
                              size="small"
                              aria-label={t.common.edit}
                              onClick={() => handleEdit(skill)}
                              sx={{ color: '#2563eb' }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              aria-label={t.common.delete}
                              onClick={() => handleDelete(skill)}
                              sx={{ color: '#ef4444' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {skills && (
            <Box sx={{ p: 2, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {t.skills.paging(skills.page + 1, skills.totalPages, skills.totalElements)}
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>

      {/* Edit Modal */}
      <SkillEditModal
        open={modalOpen}
        skill={selectedSkill}
        skillProfiles={skillProfiles}
        onClose={handleModalClose}
        onSave={handleModalSave}
      />
    </Box>
  );
}
