import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSkill } from '../hooks/useSkills';
import { useSkillGrades } from '../hooks/useSkillGrades';
import { useSkillProfiles } from '../hooks/useSkillProfiles';
import { DataTable } from '../components/DataTable';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { Skill, SkillRequest, SkillGrade, SkillGradeRequest } from '../types';
import { skillService } from '../services/skillService';
import { skillGradeService } from '../services/skillGradeService';

export function SkillDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const skillId = Number(id);

  // Validate skill ID
  if (isNaN(skillId)) {
    return (
      <div style={{ padding: '20px' }}>
        <ErrorMessage message="Invalid skill ID" />
        <button onClick={() => navigate('/skills')}>Back to Skills</button>
      </div>
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
      <div style={{ padding: '20px' }}>
        <ErrorMessage message={skillError || 'Skill not found'} />
        <button
          onClick={() => navigate('/skills')}
          style={{
            marginTop: '10px',
            padding: '10px 20px',
            cursor: 'pointer',
          }}
        >
          Back to Skills
        </button>
      </div>
    );
  }

  const gradeColumns = [
    { key: 'code', header: 'Code' },
    { key: 'description', header: 'Description' },
  ];

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
        <button
          onClick={handleBack}
          style={{
            padding: '8px 16px',
            cursor: 'pointer',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          ← Back
        </button>
        <h1>Skill: {skill.name}</h1>
      </div>

      {/* Skill Information Section */}
      <div
        style={{
          marginBottom: '40px',
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: '#f9f9f9',
        }}
      >
        <h2>Skill Information</h2>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Name *</label>
          <input
            type="text"
            value={skillFormData.name}
            onChange={(e) => handleSkillChange('name', e.target.value)}
            disabled={skillSaving}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Skill Profile *</label>
          <select
            value={skillFormData.skillProfileId}
            onChange={(e) => handleSkillChange('skillProfileId', Number(e.target.value))}
            disabled={skillSaving}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value={0}>Select a skill profile</option>
            {skillProfiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Description</label>
          <textarea
            value={skillFormData.description}
            onChange={(e) => handleSkillChange('description', e.target.value)}
            disabled={skillSaving}
            rows={3}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
          <button
            onClick={handleSkillSave}
            disabled={!skillDirty || skillSaving}
            style={{
              padding: '10px 20px',
              backgroundColor: skillDirty && !skillSaving ? '#28a745' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: skillDirty && !skillSaving ? 'pointer' : 'not-allowed',
            }}
          >
            {skillSaving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={handleSkillCancel}
            disabled={!skillDirty || skillSaving}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: skillDirty && !skillSaving ? 'pointer' : 'not-allowed',
            }}
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Skill Grades Section */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h2>Skill Grades</h2>
          <button
            onClick={handleGradeCreate}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Add Grade
          </button>
        </div>

        {/* Grade Form */}
        {showGradeForm && (
          <div
            style={{
              marginBottom: '20px',
              padding: '20px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: '#f9f9f9',
            }}
          >
            <h3>{editingGrade ? 'Edit Grade' : 'New Grade'}</h3>
            <form onSubmit={handleGradeSubmit}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Code *</label>
                <input
                  type="text"
                  value={gradeFormData.code}
                  onChange={(e) => setGradeFormData({ ...gradeFormData, code: e.target.value })}
                  required
                  placeholder="e.g., beginner, intermediate, advanced, expert"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Description</label>
                <textarea
                  value={gradeFormData.description}
                  onChange={(e) => setGradeFormData({ ...gradeFormData, description: e.target.value })}
                  rows={3}
                  placeholder="Describe what this grade level means"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
              <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleGradeCancel}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
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
      </div>
    </div>
  );
}
