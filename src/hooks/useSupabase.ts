import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Medicine, Location, Alert, Reorder } from '../types';

// Hook for managing medicines
export function useMedicines() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedicines(data || []);
    } catch (err: any) {
      console.error('Error fetching medicines:', err);
      if (err.code === '42P01') {
        setError('Database tables not found. Please set up Supabase first.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const addMedicine = async (medicine: Omit<Medicine, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .insert([medicine])
        .select()
        .single();

      if (error) throw error;
      setMedicines(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      console.error('Error adding medicine:', err);
      throw err;
    }
  };

  const updateMedicine = async (id: string, updates: Partial<Medicine>) => {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setMedicines(prev => prev.map(m => m.id === id ? data : m));
      return data;
    } catch (err: any) {
      console.error('Error updating medicine:', err);
      throw err;
    }
  };

  const deleteMedicine = async (id: string) => {
    try {
      const { error } = await supabase
        .from('medicines')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMedicines(prev => prev.filter(m => m.id !== id));
    } catch (err: any) {
      console.error('Error deleting medicine:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchMedicines();

    // Set up real-time subscription
    const subscription = supabase
      .channel('medicines_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'medicines' },
        (payload) => {
          console.log('Medicine change received:', payload);
          fetchMedicines(); // Refetch data on any change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    medicines,
    loading,
    error,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    refetch: fetchMedicines
  };
}

// Hook for managing locations
export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name');

      if (error) throw error;
      setLocations(data || []);
    } catch (err: any) {
      console.error('Error fetching locations:', err);
      if (err.code === '42P01' || err.message?.includes('does not exist')) {
        setError('Database tables not found. Please set up Supabase first.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return {
    locations,
    loading,
    error,
    refetch: fetchLocations
  };
}

// Hook for managing alerts
export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First check if tables exist by trying a simple query
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('is_resolved', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (err: any) {
      console.error('Error fetching alerts:', err);
      if (err.code === '42P01' || err.code === 'PGRST200' || err.message?.includes('does not exist') || err.message?.includes('relationship')) {
        setError('Database tables not found. Please set up Supabase first.');
        setAlerts([]);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (id: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_resolved: true, resolved_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      console.error('Error resolving alert:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchAlerts();

    // Set up real-time subscription
    const subscription = supabase
      .channel('alerts_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'alerts' },
        (payload) => {
          console.log('Alert change received:', payload);
          fetchAlerts(); // Refetch data on any change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    alerts,
    loading,
    error,
    resolveAlert,
    refetch: fetchAlerts
  };
}

// Hook for managing reorders
export function useReorders() {
  const [reorders, setReorders] = useState<Reorder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReorders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First check if tables exist by trying a simple query
      const { data, error } = await supabase
        .from('reorders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReorders(data || []);
    } catch (err: any) {
      console.error('Error fetching reorders:', err);
      if (err.code === '42P01' || err.code === 'PGRST200' || err.message?.includes('does not exist') || err.message?.includes('relationship')) {
        setError('Database tables not found. Please set up Supabase first.');
        setReorders([]);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateReorderStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('reorders')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      setReorders(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (err: any) {
      console.error('Error updating reorder status:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchReorders();

    // Set up real-time subscription
    const subscription = supabase
      .channel('reorders_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'reorders' },
        (payload) => {
          console.log('Reorder change received:', payload);
          fetchReorders(); // Refetch data on any change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    reorders,
    loading,
    error,
    updateReorderStatus,
    refetch: fetchReorders
  };
}

// Hook for checking database setup
export function useDatabaseSetup() {
  const [isSetup, setIsSetup] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkSetup = async () => {
    try {
      setLoading(true);
      
      // Try to query the medicines table to check if database is set up
      const { error } = await supabase
        .from('medicines')
        .select('id')
        .limit(1);

      setIsSetup(!error || error.code !== '42P01');
    } catch (err) {
      setIsSetup(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSetup();
  }, []);

  return {
    isSetup,
    loading,
    checkSetup
  };
}