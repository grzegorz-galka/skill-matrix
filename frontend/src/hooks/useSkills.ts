import { useState, useEffect } from 'react';
import { Skill } from '../types';
import { skillService } from '../services/skillService';

export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const data = await skillService.getAll();
      setSkills(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch skills');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  return { skills, loading, error, refetch: fetchSkills };
}

export function useSkill(id: number | null) {
  const [skill, setSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSkill = async () => {
    if (id === null) {
      setSkill(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await skillService.getById(id);
      setSkill(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch skill');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkill();
  }, [id]);

  return { skill, loading, error, refetch: fetchSkill };
}
