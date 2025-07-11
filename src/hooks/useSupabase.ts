import { useState, useEffect } from 'react';
import { supabase, Medicine, Location, Alert, Reorder } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useMedicines() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMedicines();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('medicines-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'medicines' },
        (payload) => {
          console.log('Medicine change received:', payload);
          fetchMedicines(); // Refetch data on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedicines(data || []);
    } catch (err: any) {
      setError(err.message);
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
      return data;
    } catch (err: any) {
      setError(err.message);
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
      return data;
    } catch (err: any) {
      setError(err.message);
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
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

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

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name');

      if (error) throw error;
      setLocations(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { locations, loading, error, refetch: fetchLocations };
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAlerts();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('alerts-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'alerts' },
        (payload) => {
          console.log('Alert change received:', payload);
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('alerts')
        .select(`
          *,
          medicines (
            name,
            batch_id,
            location
          )
        `)
        .eq('is_resolved', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (id: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_resolved: true })
        .eq('id', id);

      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return { alerts, loading, error, resolveAlert, refetch: fetchAlerts };
}

export function useReorders() {
  const [reorders, setReorders] = useState<Reorder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReorders();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('reorders-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'reorders' },
        (payload) => {
          console.log('Reorder change received:', payload);
          fetchReorders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchReorders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reorders')
        .select(`
          *,
          medicines (
            name,
            batch_id,
            manufacturer
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReorders(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createReorder = async (reorder: Omit<Reorder, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('reorders')
        .insert([reorder])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateReorderStatus = async (id: string, status: Reorder['status']) => {
    try {
      const { error } = await supabase
        .from('reorders')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return { reorders, loading, error, createReorder, updateReorderStatus, refetch: fetchReorders };
}