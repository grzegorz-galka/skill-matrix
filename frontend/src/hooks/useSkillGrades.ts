import { useState, useEffect, useCallback } from 'react';
import { SkillGrade } from '../types';
import { skillGradeService } from '../services/skillGradeService';

export function useSkillGrades(skillId: number | null) {
  const [skillGrades, setSkillGrades] = useState<SkillGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const fetchSkillGrades = useCallback(async () => {
    if (!skillId) {
      setSkillGrades([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await skillGradeService.getBySkillId(skillId);
      setSkillGrades(data);
      setError(null);
    } catch (err) {
      setError(err);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [skillId]);

  useEffect(() => {
    fetchSkillGrades();
  }, [fetchSkillGrades]);

  return { skillGrades, loading, error, refetch: fetchSkillGrades };
}
