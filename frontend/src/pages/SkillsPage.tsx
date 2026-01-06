import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSkills } from '../hooks/useSkills';
import { useSkillProfiles } from '../hooks/useSkillProfiles';
import { DataTable } from '../components/DataTable';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { Skill, SkillRequest } from '../types';
import { skillService } from '../services/skillService';

export function SkillsPage() {
  const navigate = useNavigate();
  const { skills, loading, error, refetch } = useSkills();
  const { skillProfiles } = useSkillProfiles();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<SkillRequest>({
    name: '',
    skillProfileId: 0,
    description: '',
  });

  const handleCreate = () => {
    setFormData({ name: '', skillProfileId: 0, description: '' });
    setShowForm(true);
  };

  const handleEdit = (skill: Skill) => {
    navigate(`/skills/${skill.id}`);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await skillService.create(formData);
      setShowForm(false);
      refetch();
    } catch (err) {
      alert('Failed to save skill');
    }
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'skillProfileName', header: 'Skill Profile' },
    { key: 'description', header: 'Description' },
  ];

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Skills</h1>
        <button
          onClick={handleCreate}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Add Skill
        </button>
      </div>

      {showForm && (
        <div
          style={{
            marginBottom: '20px',
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: '#f9f9f9',
          }}
        >
          <h2>New Skill</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Skill Profile *</label>
              <select
                value={formData.skillProfileId}
                onChange={(e) => setFormData({ ...formData, skillProfileId: Number(e.target.value) })}
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
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
            <div style={{ marginTop: '15px' }}>
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '10px',
                }}
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
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

      <DataTable
        data={skills}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
