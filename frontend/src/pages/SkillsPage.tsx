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
import { useJobProfiles } from '../hooks/useJobProfiles';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { SkillEditModal } from '../components/SkillEditModal';
import { Skill } from '../types';
import { skillService } from '../services/skillService';

export function SkillsPage() {
  const [page] = useState(0);
  const { skills, loading, error, refetch } = useSkills(page, 20);
  const { jobProfiles } = useJobProfiles();
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
    if (confirm(`Delete skill ${skill.name}?`)) {
      try {
        await skillService.delete(skill.id);
        refetch();
      } catch (err) {
        alert('Failed to delete skill');
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
  if (error) return <ErrorMessage message={error} />;

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
                Skills
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage individual skills and their associated job profiles
              </Typography>
            </Box>
          </Box>
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
            Add Skill
          </Button>
        </Box>

        {/* Skills Table */}
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f9fafb' }}>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Job Profiles</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Grades</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2, textAlign: 'right' }}>Actions</TableCell>
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
                        {skill.jobProfiles?.length > 0 ? (
                          skill.jobProfiles.map((jp) => (
                            <Chip
                              key={jp.id}
                              label={jp.name}
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
                            None
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
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        {skill.grades?.slice(0, 3).map((_, index) => (
                          <Box
                            key={index}
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              bgcolor: '#8b5cf6',
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
                        ))}
                        {skill.grades?.length > 3 && (
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              bgcolor: '#e0e7ff',
                              color: '#5b21b6',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                            }}
                          >
                            +{skill.grades.length - 3}
                          </Box>
                        )}
                        {(!skill.grades || skill.grades.length === 0) && (
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ py: 2, textAlign: 'right' }}>
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(skill)}
                          sx={{ color: '#2563eb' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(skill)}
                          sx={{ color: '#ef4444' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
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
                Page {skills.page + 1} of {skills.totalPages} (Total: {skills.totalElements} skills)
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>

      {/* Edit Modal */}
      <SkillEditModal
        open={modalOpen}
        skill={selectedSkill}
        jobProfiles={jobProfiles}
        onClose={handleModalClose}
        onSave={handleModalSave}
      />
    </Box>
  );
}
