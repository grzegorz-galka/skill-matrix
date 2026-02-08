import { useState, useEffect } from 'react';
import { SkillProfile } from '../types';
import { skillProfileService } from '../services/skillProfileService';

export function useSkillProfiles() {
  const [skillProfiles, setSkillProfiles] = useState<SkillProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSkillProfiles = async () => {
    try {
      setLoading(true);
      const data = await skillProfileService.getAll();
      setSkillProfiles(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch skill profiles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillProfiles();
  }, []);

  return { skillProfiles, loading, error, refetch: fetchSkillProfiles };
}

export function useSkillProfile(id: number | null) {
  const [skillProfile, setSkillProfile] = useState<SkillProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id === null) {
      setSkillProfile(null);
      setLoading(false);
      return;
    }

    const fetchSkillProfile = async () => {
      try {
        setLoading(true);
        const data = await skillProfileService.getById(id);
        setSkillProfile(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch skill profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSkillProfile();
  }, [id]);

  return { skillProfile, loading, error };
}
