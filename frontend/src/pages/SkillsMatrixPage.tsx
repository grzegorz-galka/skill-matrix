import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Stack,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  IconButton,
  Collapse,
  Button,
  Autocomplete,
} from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import AddIcon from '@mui/icons-material/Add';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DownloadIcon from '@mui/icons-material/Download';
import * as XLSX from 'xlsx';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import {
  SkillsMatrixFilterRequest,
  SkillsMatrixResponse,
  SkillsMatrixFilterHints,
  MatrixEmployee,
  MatrixSkill,
} from '../types';
import { skillsMatrixService } from '../services/skillsMatrixService';
import { getLevelColor, getLevelTextColor, LEVEL_COLORS, LEVEL_LABELS } from '../utils/levelColors';

interface FilterChipsProps {
  label: string;
  patterns: string[];
  onAdd: (pattern: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
  hints: string[];
}

function FilterChips({ label, patterns, onAdd, onRemove, placeholder, hints }: FilterChipsProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = (value: string) => {
    if (value.trim()) {
      onAdd(value.trim());
      setInputValue('');
    }
  };

  return (
    <Box sx={{ flex: 1, minWidth: 200 }}>
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
        {patterns.map((pattern, index) => (
          <Chip
            key={index}
            label={pattern}
            size="small"
            onDelete={() => onRemove(index)}
            sx={{
              bgcolor: '#dbeafe',
              color: '#1e40af',
              '& .MuiChip-deleteIcon': { color: '#1e40af' },
            }}
          />
        ))}
      </Box>
      <Autocomplete
        freeSolo
        size="small"
        options={hints.filter((h) => !patterns.includes(h))}
        inputValue={inputValue}
        onInputChange={(_, newValue) => setInputValue(newValue)}
        onChange={(_, newValue) => {
          if (newValue) {
            handleAdd(newValue);
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inputValue.trim()) {
                e.preventDefault();
                handleAdd(inputValue);
              }
            }}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {params.InputProps.endAdornment}
                  <IconButton
                    size="small"
                    onClick={() => handleAdd(inputValue)}
                    sx={{ color: '#2563eb' }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => (
          <li {...props}>
            <Typography variant="body2">{option}</Typography>
          </li>
        )}
      />
    </Box>
  );
}

export function SkillsMatrixPage() {
  const [matrixData, setMatrixData] = useState<SkillsMatrixResponse | null>(null);
  const [filterHints, setFilterHints] = useState<SkillsMatrixFilterHints | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  const [filters, setFilters] = useState<SkillsMatrixFilterRequest>({
    namePatterns: [],
    departmentPatterns: [],
    positionPatterns: [],
    skillNamePatterns: [],
    skillProfilePatterns: [],
  });

  // Fetch filter hints on mount
  useEffect(() => {
    skillsMatrixService.getFilterHints()
      .then(setFilterHints)
      .catch((err) => console.error('Failed to load filter hints', err));
  }, []);

  const fetchMatrix = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await skillsMatrixService.getMatrix(filters);
      setMatrixData(data);
    } catch (err) {
      setError('Failed to load skills matrix');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMatrix();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchMatrix]);

  const addPattern = (field: keyof SkillsMatrixFilterRequest, pattern: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), pattern],
    }));
  };

  const removePattern = (field: keyof SkillsMatrixFilterRequest, index: number) => {
    setFilters((prev) => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index),
    }));
  };

  const getCellKey = (employeeId: number, skillId: number) => `${employeeId}_${skillId}`;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const formatGradeSummary = (skillId: number): JSX.Element => {
    const summary = matrixData?.skillSummaries[skillId];
    if (!summary || Object.keys(summary.gradeCounts).length === 0) {
      return <Typography variant="caption" color="text.disabled">-</Typography>;
    }
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25 }}>
        {Object.entries(summary.gradeCounts)
          .sort(([, a], [, b]) => b - a)
          .map(([grade, count]) => (
            <Typography key={grade} variant="caption" sx={{ whiteSpace: 'nowrap' }}>
              {grade}: {count}
            </Typography>
          ))}
      </Box>
    );
  };

  const handleExportToExcel = () => {
    if (!matrixData) return;

    // Build worksheet data
    const wsData: (string | number)[][] = [];

    // Header row
    const headerRow = ['Employee', 'Department', 'Position', ...matrixData.skills.map((s) => s.name)];
    wsData.push(headerRow);

    // Employee rows
    matrixData.employees.forEach((employee) => {
      const row: (string | number)[] = [
        `${employee.firstName} ${employee.lastName}`,
        employee.department || '',
        employee.position || '',
      ];
      matrixData.skills.forEach((skill) => {
        const cell = matrixData.cells[getCellKey(employee.id, skill.id)];
        row.push(cell ? cell.gradeCode : '');
      });
      wsData.push(row);
    });

    // Summary row
    const summaryRow: (string | number)[] = ['Summary', '', ''];
    matrixData.skills.forEach((skill) => {
      const summary = matrixData.skillSummaries[skill.id];
      if (summary && Object.keys(summary.gradeCounts).length > 0) {
        const summaryText = Object.entries(summary.gradeCounts)
          .map(([grade, count]) => `${grade}: ${count}`)
          .join('\n');
        summaryRow.push(summaryText);
      } else {
        summaryRow.push('');
      }
    });
    wsData.push(summaryRow);

    // Create workbook and worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Skills Matrix');

    // Auto-size columns
    const colWidths = headerRow.map((_, colIndex) => {
      const maxLen = wsData.reduce((max, row) => {
        const cellValue = String(row[colIndex] || '');
        const lines = cellValue.split('\n');
        const maxLineLen = Math.max(...lines.map((l) => l.length));
        return Math.max(max, maxLineLen);
      }, 10);
      return { wch: Math.min(maxLen + 2, 30) };
    });
    ws['!cols'] = colWidths;

    // Download
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `skills-matrix-${date}.xlsx`);
  };

  if (loading && !matrixData) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Page Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: '#8b5cf6' }}>
              <GridViewIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                Skills Matrix
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View employee skills at a glance
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExportToExcel}
            disabled={!matrixData || matrixData.employees.length === 0}
            sx={{
              bgcolor: '#10b981',
              '&:hover': { bgcolor: '#059669' },
              textTransform: 'none',
              px: 3,
            }}
          >
            Export to Excel
          </Button>
        </Box>

        {/* Filters Section */}
        <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={() => setFiltersExpanded(!filtersExpanded)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterAltIcon sx={{ color: '#6b7280' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Filters
              </Typography>
            </Box>
            <IconButton size="small">
              {filtersExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>

          <Collapse in={filtersExpanded}>
            <Box sx={{ mt: 3 }}>
              {/* Employee Filters */}
              <Typography
                variant="subtitle2"
                sx={{ mb: 2, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}
              >
                Employee Filters
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <FilterChips
                  label="Name"
                  patterns={filters.namePatterns || []}
                  onAdd={(p) => addPattern('namePatterns', p)}
                  onRemove={(i) => removePattern('namePatterns', i)}
                  placeholder="e.g., John* or *Smith"
                  hints={filterHints?.names || []}
                />
                <FilterChips
                  label="Department"
                  patterns={filters.departmentPatterns || []}
                  onAdd={(p) => addPattern('departmentPatterns', p)}
                  onRemove={(i) => removePattern('departmentPatterns', i)}
                  placeholder="e.g., Engineering*"
                  hints={filterHints?.departments || []}
                />
                <FilterChips
                  label="Position"
                  patterns={filters.positionPatterns || []}
                  onAdd={(p) => addPattern('positionPatterns', p)}
                  onRemove={(i) => removePattern('positionPatterns', i)}
                  placeholder="e.g., *Developer*"
                  hints={filterHints?.positions || []}
                />
              </Stack>

              {/* Skill Filters */}
              <Typography
                variant="subtitle2"
                sx={{ mb: 2, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}
              >
                Skill Filters
              </Typography>
              <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
                <FilterChips
                  label="Skill Name"
                  patterns={filters.skillNamePatterns || []}
                  onAdd={(p) => addPattern('skillNamePatterns', p)}
                  onRemove={(i) => removePattern('skillNamePatterns', i)}
                  placeholder="e.g., Java* or Python"
                  hints={filterHints?.skillNames || []}
                />
                <FilterChips
                  label="Skill Profile"
                  patterns={filters.skillProfilePatterns || []}
                  onAdd={(p) => addPattern('skillProfilePatterns', p)}
                  onRemove={(i) => removePattern('skillProfilePatterns', i)}
                  placeholder="e.g., Backend*"
                  hints={filterHints?.skillProfileNames || []}
                />
              </Stack>
            </Box>
          </Collapse>
        </Paper>

        {/* Grade Legend */}
        <Paper sx={{ p: 2, borderRadius: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
              Level Scale:
            </Typography>
            {Object.entries(LEVEL_COLORS).map(([level, color]) => (
              <Box key={level} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: 0.5,
                    bgcolor: color,
                    border: '1px solid rgba(0,0,0,0.1)',
                  }}
                />
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  L{level}: {LEVEL_LABELS[Number(level)]}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Matrix Table */}
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          {matrixData && matrixData.employees.length > 0 && matrixData.skills.length > 0 ? (
            <TableContainer sx={{ maxHeight: 'calc(100vh - 400px)' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 'bold',
                        bgcolor: '#f1f5f9',
                        minWidth: 200,
                        position: 'sticky',
                        left: 0,
                        zIndex: 3,
                      }}
                    >
                      Employee
                    </TableCell>
                    {matrixData.skills.map((skill: MatrixSkill) => (
                      <TableCell
                        key={skill.id}
                        align="center"
                        sx={{
                          fontWeight: 'bold',
                          bgcolor: '#f1f5f9',
                          minWidth: 100,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Tooltip
                          title={
                            skill.skillProfileNames.length > 0
                              ? `Profiles: ${skill.skillProfileNames.join(', ')}`
                              : 'No profiles'
                          }
                        >
                          <span>{skill.name}</span>
                        </Tooltip>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {matrixData.employees.map((employee: MatrixEmployee) => (
                    <TableRow key={employee.id} hover>
                      <TableCell
                        sx={{
                          position: 'sticky',
                          left: 0,
                          bgcolor: 'white',
                          zIndex: 1,
                          borderRight: '1px solid #e5e7eb',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              bgcolor: getAvatarColor(employee.firstName),
                              width: 32,
                              height: 32,
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                            }}
                          >
                            {getInitials(employee.firstName, employee.lastName)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {employee.firstName} {employee.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {employee.position || employee.department || ''}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      {matrixData.skills.map((skill: MatrixSkill) => {
                        const cellKey = getCellKey(employee.id, skill.id);
                        const cell = matrixData.cells[cellKey];
                        return (
                          <TableCell key={skill.id} align="center">
                            {cell ? (
                              <Tooltip
                                title={
                                  <>
                                    <div>
                                      L{cell.level}: {cell.gradeCode}
                                    </div>
                                    {cell.gradeDescription && <div>{cell.gradeDescription}</div>}
                                    {cell.yearsOfExperience && (
                                      <div>{cell.yearsOfExperience} years exp.</div>
                                    )}
                                    {cell.certified && <div>Certified</div>}
                                  </>
                                }
                              >
                                <Chip
                                  size="small"
                                  label={cell.gradeCode}
                                  sx={{
                                    bgcolor: getLevelColor(cell.level),
                                    color: getLevelTextColor(cell.level),
                                    fontWeight: 'bold',
                                    fontSize: '0.7rem',
                                    height: 24,
                                    border: '1px solid rgba(0,0,0,0.1)',
                                  }}
                                />
                              </Tooltip>
                            ) : (
                              <Typography variant="body2" color="text.disabled">
                                -
                              </Typography>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}

                  {/* Summary Row */}
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell
                      sx={{
                        position: 'sticky',
                        left: 0,
                        bgcolor: '#f1f5f9',
                        fontWeight: 'bold',
                        zIndex: 1,
                        borderRight: '1px solid #e5e7eb',
                        verticalAlign: 'top',
                        pt: 2,
                      }}
                    >
                      Summary
                    </TableCell>
                    {matrixData.skills.map((skill: MatrixSkill) => (
                      <TableCell
                        key={skill.id}
                        align="center"
                        sx={{
                          bgcolor: '#f8fafc',
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          verticalAlign: 'top',
                          pt: 1.5,
                        }}
                      >
                        {formatGradeSummary(skill.id)}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <Typography color="text.secondary">
                {matrixData?.employees.length === 0 && matrixData?.skills.length === 0
                  ? 'No employees or skills have grades assigned'
                  : matrixData?.employees.length === 0
                  ? 'No employees with grades match the filters'
                  : matrixData?.skills.length === 0
                  ? 'No skills with grades match the filters'
                  : 'No data available'}
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Stats Footer */}
        {matrixData && (
          <Box sx={{ mt: 2, display: 'flex', gap: 3, justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {matrixData.employees.length} employees
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {matrixData.skills.length} skills
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Object.keys(matrixData.cells).length} grades assigned
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}
