import { useState, useEffect, useCallback } from 'react';
import { Skill, Page } from '../types';
import { skillService } from '../services/skillService';

export function useSkills(page = 0, size = 20) {
  const [skills, setSkills] = useState<Page<Skill> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const fetchSkills = useCallback(async () => {
    try {
      setLoading(true);
      const data = await skillService.getAll(page, size);
      setSkills(data);
      setError(null);
    } catch (err) {
      setError(err);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  return { skills, loading, error, refetch: fetchSkills };
}

export function useSkill(id: number | null) {
  const [skill, setSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const fetchSkill = useCallback(async () => {
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
      setError(err);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSkill();
  }, [fetchSkill]);

  return { skill, loading, error, refetch: fetchSkill };
}
