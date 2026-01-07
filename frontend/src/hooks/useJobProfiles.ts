import { useState, useEffect } from 'react';
import { JobProfile } from '../types';
import { jobProfileService } from '../services/jobProfileService';

export function useJobProfiles() {
  const [jobProfiles, setJobProfiles] = useState<JobProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobProfiles = async () => {
    try {
      setLoading(true);
      const data = await jobProfileService.getAll();
      setJobProfiles(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch job profiles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobProfiles();
  }, []);

  return { jobProfiles, loading, error, refetch: fetchJobProfiles };
}

export function useJobProfile(id: number | null) {
  const [jobProfile, setJobProfile] = useState<JobProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id === null) {
      setJobProfile(null);
      setLoading(false);
      return;
    }

    const fetchJobProfile = async () => {
      try {
        setLoading(true);
        const data = await jobProfileService.getById(id);
        setJobProfile(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch job profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobProfile();
  }, [id]);

  return { jobProfile, loading, error };
}
