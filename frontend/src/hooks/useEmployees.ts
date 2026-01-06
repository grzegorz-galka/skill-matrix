import { useState, useEffect } from 'react';
import { Employee, Page } from '../types';
import { employeeService } from '../services/employeeService';

export function useEmployees(page = 0, size = 20) {
  const [employees, setEmployees] = useState<Page<Employee> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getAll(page, size);
      setEmployees(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch employees');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [page, size]);

  return { employees, loading, error, refetch: fetchEmployees };
}

export function useEmployee(id: number | null) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id === null) {
      setEmployee(null);
      setLoading(false);
      return;
    }

    const fetchEmployee = async () => {
      try {
        setLoading(true);
        const data = await employeeService.getById(id);
        setEmployee(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch employee');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  return { employee, loading, error };
}
