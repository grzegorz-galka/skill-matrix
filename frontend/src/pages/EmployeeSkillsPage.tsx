import { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  InputAdornment,
  Avatar,
  IconButton,
  Checkbox,
  FormControlLabel,
  Switch,
  Autocomplete,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SchoolIcon from '@mui/icons-material/School';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useEmployees } from '../hooks/useEmployees';
import { skillService } from '../services/skillService';
import { skillGradeService } from '../services/skillGradeService';
import { employeeSkillGradeService } from '../services/employeeSkillGradeService';
import { employeeService } from '../services/employeeService';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { Skill, SkillGrade, Employee, JobProfile } from '../types';

interface SkillWithGrades extends Skill {
  grades: SkillGrade[];
}

interface PossessedSkill {
  skill: Skill;
  selectedGradeId: number | null;
  employeeSkillGradeId?: number;
}

export function EmployeeSkillsPage() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const { employees, loading: employeesLoading } = useEmployees(0, 1000);

  const [allSkills, setAllSkills] = useState<SkillWithGrades[]>([]);
  const [possessedSkills, setPossessedSkills] = useState<PossessedSkill[]>([]);
  const [employeeJobProfiles, setEmployeeJobProfiles] = useState<JobProfile[]>([]);
  const [selectedAvailableSkills, setSelectedAvailableSkills] = useState<Set<number>>(new Set());
  const [selectedPossessedSkills, setSelectedPossessedSkills] = useState<Set<number>>(new Set());

  const [showAllSkills, setShowAllSkills] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Load all skills and their grades
  useEffect(() => {
    const loadSkills = async () => {
      try {
        setLoading(true);
        const skillsPage = await skillService.getAll();

        // Load grades for each skill
        const skillsWithGrades = await Promise.all(
          skillsPage.content.map(async (skill) => {
            const grades = await skillGradeService.getBySkillId(skill.id);
            return { ...skill, grades };
          })
        );

        setAllSkills(skillsWithGrades);
        setError(null);
      } catch (err) {
        setError('Failed to load skills');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadSkills();
  }, []);

  // Load employee's possessed skills and job profiles when employee changes
  useEffect(() => {
    if (!selectedEmployee) {
      setPossessedSkills([]);
      setEmployeeJobProfiles([]);
      setHasChanges(false);
      return;
    }

    const loadEmployeeData = async () => {
      try {
        setLoading(true);

        // Fetch employee's job profiles
        const jobProfiles = await employeeService.getJobProfiles(selectedEmployee.id);
        setEmployeeJobProfiles(jobProfiles);

        // Fetch employee's skill grades
        const employeeSkillGrades = await employeeSkillGradeService.getByEmployeeId(selectedEmployee.id);

        // Convert to possessed skills format
        const possessed = employeeSkillGrades.map((esg) => {
          const skill = allSkills.find(s => s.id === esg.skillId);
          return {
            skill: skill || {
              id: esg.skillId,
              name: esg.skillName,
              jobProfiles: [],
              createdAt: '',
              updatedAt: '',
              grades: []
            },
            selectedGradeId: esg.skillGradeId,
            employeeSkillGradeId: esg.id,
          };
        });

        setPossessedSkills(possessed);
        setHasChanges(false);
        setError(null);
      } catch (err) {
        setError('Failed to load employee data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (allSkills.length > 0) {
      loadEmployeeData();
    }
  }, [selectedEmployee, allSkills]);

  // Get employee's job profiles to filter available skills
  const employeeJobProfileIds = useMemo(() => {
    return new Set(employeeJobProfiles.map(jp => jp.id));
  }, [employeeJobProfiles]);

  // Filter available skills
  const availableSkills = useMemo(() => {
    const possessedSkillIds = new Set(possessedSkills.map(ps => ps.skill.id));

    return allSkills
      .filter(skill => !possessedSkillIds.has(skill.id))
      .filter(skill => {
        // Filter by job profiles if "Show all skills" is off
        if (!showAllSkills) {
          // If employee has no job profiles, show no skills
          if (employeeJobProfileIds.size === 0) return false;
          // Otherwise, only show skills that belong to employee's job profiles
          return skill.jobProfiles.some(jp => employeeJobProfileIds.has(jp.id));
        }
        // Show all skills when toggle is on
        return true;
      })
      .filter(skill => {
        // Filter by search text
        if (!filterText) return true;
        const searchLower = filterText.toLowerCase();
        return skill.name.toLowerCase().includes(searchLower) ||
               skill.jobProfiles.some(jp => jp.name.toLowerCase().includes(searchLower));
      });
  }, [allSkills, possessedSkills, showAllSkills, employeeJobProfileIds, filterText]);

  const handleMoveToPressed = () => {
    const skillsToMove = availableSkills.filter(skill => selectedAvailableSkills.has(skill.id));
    const newPossessed = skillsToMove.map(skill => ({
      skill,
      selectedGradeId: skill.grades.length > 0 ? skill.grades[0].id : null,
    }));

    setPossessedSkills([...possessedSkills, ...newPossessed]);
    setSelectedAvailableSkills(new Set());
    setHasChanges(true);
  };

  const handleMoveToAvailable = () => {
    const newPossessed = possessedSkills.filter(ps => !selectedPossessedSkills.has(ps.skill.id));
    setPossessedSkills(newPossessed);
    setSelectedPossessedSkills(new Set());
    setHasChanges(true);
  };

  const handleGradeChange = (skillId: number, gradeId: number) => {
    setPossessedSkills(possessedSkills.map(ps =>
      ps.skill.id === skillId ? { ...ps, selectedGradeId: gradeId } : ps
    ));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!selectedEmployee) return;

    try {
      setLoading(true);

      // Delete removed skills
      const currentSkillIds = new Set(possessedSkills.map(ps => ps.skill.id));
      const toDelete = possessedSkills
        .filter(ps => ps.employeeSkillGradeId && !currentSkillIds.has(ps.skill.id))
        .map(ps => ps.employeeSkillGradeId!);

      for (const id of toDelete) {
        await employeeSkillGradeService.delete(id);
      }

      // Create or update possessed skills
      for (const ps of possessedSkills) {
        if (!ps.selectedGradeId) continue;

        const request = {
          employeeId: selectedEmployee.id,
          skillGradeId: ps.selectedGradeId,
          certified: false,
        };

        if (ps.employeeSkillGradeId) {
          await employeeSkillGradeService.update(ps.employeeSkillGradeId, request);
        } else {
          await employeeSkillGradeService.create(request);
        }
      }

      setHasChanges(false);
      alert('Changes saved successfully');

      // Reload employee skills
      const employeeSkillGrades = await employeeSkillGradeService.getByEmployeeId(selectedEmployee.id);
      const possessed = employeeSkillGrades.map((esg) => {
        const skill = allSkills.find(s => s.id === esg.skillId);
        return {
          skill: skill || {
            id: esg.skillId,
            name: esg.skillName,
            jobProfiles: [],
            createdAt: '',
            updatedAt: '',
            grades: []
          },
          selectedGradeId: esg.skillGradeId,
          employeeSkillGradeId: esg.id,
        };
      });
      setPossessedSkills(possessed);

    } catch (err) {
      alert('Failed to save changes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedEmployee(null);
    setPossessedSkills([]);
    setEmployeeJobProfiles([]);
    setSelectedAvailableSkills(new Set());
    setSelectedPossessedSkills(new Set());
    setHasChanges(false);
  };

  if (employeesLoading || loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f3f4f6' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Page Header */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 4 }}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: '#8b5cf6' }}>
            <SchoolIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Employee Skills
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage employee skill grades and competencies
            </Typography>
          </Box>
        </Box>

        {/* Employee Selector */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 500 }}>
            Select Employee
          </Typography>
          <Autocomplete
            options={employees?.content || []}
            value={selectedEmployee}
            onChange={(_event, newValue) => setSelectedEmployee(newValue)}
            getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search for an employee..."
                size="small"
              />
            )}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            fullWidth
          />
        </Paper>

        {selectedEmployee && (
          <>
            {/* Skills Management Section */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              {/* Available Skills Panel */}
              <Paper sx={{ flex: 1, p: 3, borderRadius: 2, border: '2px solid #93c5fd' }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#3b82f6' }}>
                      <SchoolIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Available Skills
                    </Typography>
                  </Box>
                  <Box sx={{
                    bgcolor: '#dbeafe',
                    color: '#1e40af',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    fontWeight: 'bold',
                    fontSize: '0.875rem'
                  }}>
                    {availableSkills.length}
                  </Box>
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  Select skills to add
                </Typography>

                {/* Show All Skills Toggle */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={showAllSkills}
                      onChange={(e) => setShowAllSkills(e.target.checked)}
                      size="small"
                    />
                  }
                  label={<Typography variant="body2">Show all skills</Typography>}
                  sx={{ mb: 2 }}
                />

                {/* Filter */}
                <TextField
                  placeholder="Filter skills..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  fullWidth
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 18, color: '#9ca3af' }} />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Skills List */}
                <Box sx={{
                  maxHeight: '500px',
                  overflowY: 'auto',
                  border: '1px solid #e5e7eb',
                  borderRadius: 1,
                  bgcolor: '#fff'
                }}>
                  {availableSkills.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
                      No available skills
                    </Typography>
                  ) : (
                    availableSkills.map((skill) => (
                      <Box
                        key={skill.id}
                        sx={{
                          p: 2,
                          borderBottom: '1px solid #f3f4f6',
                          '&:hover': { bgcolor: '#f9fafb' },
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          const newSelected = new Set(selectedAvailableSkills);
                          if (newSelected.has(skill.id)) {
                            newSelected.delete(skill.id);
                          } else {
                            newSelected.add(skill.id);
                          }
                          setSelectedAvailableSkills(newSelected);
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <Checkbox
                            checked={selectedAvailableSkills.has(skill.id)}
                            size="small"
                            sx={{ p: 0, mt: 0.5 }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {skill.name}
                            </Typography>
                            {skill.jobProfiles.length > 0 && (
                              <Typography variant="caption" color="text.secondary">
                                {skill.jobProfiles.map(jp => jp.name).join(', ')}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    ))
                  )}
                </Box>
              </Paper>

              {/* Arrow Buttons */}
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1 }}>
                <IconButton
                  onClick={handleMoveToPressed}
                  disabled={selectedAvailableSkills.size === 0}
                  sx={{
                    bgcolor: '#818cf8',
                    color: '#fff',
                    '&:hover': { bgcolor: '#6366f1' },
                    '&:disabled': { bgcolor: '#e5e7eb', color: '#9ca3af' },
                  }}
                >
                  <ArrowForwardIcon />
                </IconButton>
                <IconButton
                  onClick={handleMoveToAvailable}
                  disabled={selectedPossessedSkills.size === 0}
                  sx={{
                    bgcolor: '#818cf8',
                    color: '#fff',
                    '&:hover': { bgcolor: '#6366f1' },
                    '&:disabled': { bgcolor: '#e5e7eb', color: '#9ca3af' },
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
              </Box>

              {/* Possessed Skills Panel */}
              <Paper sx={{ flex: 1, p: 3, borderRadius: 2, border: '2px solid #86efac' }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#10b981' }}>
                      <SchoolIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Possessed Skills
                    </Typography>
                  </Box>
                  <Box sx={{
                    bgcolor: '#d1fae5',
                    color: '#065f46',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    fontWeight: 'bold',
                    fontSize: '0.875rem'
                  }}>
                    {possessedSkills.length}
                  </Box>
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
                  Employee's current skills
                </Typography>

                {/* Skills List */}
                <Box sx={{
                  maxHeight: '550px',
                  overflowY: 'auto',
                  border: '1px solid #e5e7eb',
                  borderRadius: 1,
                  bgcolor: '#fff'
                }}>
                  {possessedSkills.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
                      No skills selected
                    </Typography>
                  ) : (
                    possessedSkills.map((ps) => (
                      <Box
                        key={ps.skill.id}
                        sx={{
                          p: 2,
                          borderBottom: '1px solid #f3f4f6',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
                          <Checkbox
                            checked={selectedPossessedSkills.has(ps.skill.id)}
                            onChange={() => {
                              const newSelected = new Set(selectedPossessedSkills);
                              if (newSelected.has(ps.skill.id)) {
                                newSelected.delete(ps.skill.id);
                              } else {
                                newSelected.add(ps.skill.id);
                              }
                              setSelectedPossessedSkills(newSelected);
                            }}
                            size="small"
                            sx={{ p: 0, mt: 0.5 }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {ps.skill.name}
                            </Typography>
                            {ps.skill.jobProfiles && ps.skill.jobProfiles.length > 0 && (
                              <Typography variant="caption" color="text.secondary">
                                {ps.skill.jobProfiles.map(jp => jp.name).join(', ')}
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        {/* Skill Grade Selector */}
                        <Box sx={{ ml: 4 }}>
                          <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
                            Skill Grade
                          </Typography>
                          <FormControl fullWidth size="small">
                            <Select
                              value={ps.selectedGradeId || ''}
                              onChange={(e) => handleGradeChange(ps.skill.id, Number(e.target.value))}
                            >
                              {allSkills.find(s => s.id === ps.skill.id)?.grades.map((grade) => (
                                <MenuItem key={grade.id} value={grade.id}>
                                  {grade.code} - {grade.description || 'No description'}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                      </Box>
                    ))
                  )}
                </Box>
              </Paper>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                sx={{
                  borderColor: '#d1d5db',
                  color: '#6b7280',
                  '&:hover': { borderColor: '#9ca3af', bgcolor: '#f9fafb' },
                  textTransform: 'none',
                  px: 4,
                  py: 1,
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={!hasChanges}
                sx={{
                  bgcolor: '#10b981',
                  '&:hover': { bgcolor: '#059669' },
                  textTransform: 'none',
                  px: 4,
                  py: 1,
                  fontWeight: 'bold',
                }}
              >
                Save Changes
              </Button>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
}
