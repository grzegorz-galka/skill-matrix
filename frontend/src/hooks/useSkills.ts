import { useState, useEffect } from 'react';
import { Skill } from '../types';
import { skillService } from '../services/skillService';

export function useSkills(profileId?: number) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const data = profileId
        ? await skillService.getByProfileId(profileId)
        : await skillService.getAll();
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
  }, [profileId]);

  return { skills, loading, error, refetch: fetchSkills };
}

export function useSkill(id: number | null) {
  const [skill, setSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id === null) {
      setSkill(null);
      setLoading(false);
      return;
    }

    const fetchSkill = async () => {
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

    fetchSkill();
  }, [id]);

  return { skill, loading, error };
}
