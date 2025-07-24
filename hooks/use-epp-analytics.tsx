import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface EppAnalyticsData {
  regionalData: {
    regionalId: string | null;
    regionalName: string;
    count: number;
  }[];
  eppTypeData: {
    eppType: string;
    count: number;
  }[];
  pieChartData: {
    label: string;
    value: number;
    color: string;
  }[];
  summaryStats: {
    total: number;
    suitable: number;
    notSuitable: number;
    suitabilityRate: string;
  };
  filters: {
    dateFrom: string | null;
    dateTo: string | null;
  };
}

export const useEppAnalytics = (dateFrom?: string, dateTo?: string) => {
  const [data, setData] = useState<EppAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);

        const response = await fetch(`/api/epp-inspections/analytics?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Error al cargar los datos de análisis');
        }

        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateFrom, dateTo]);

  return { data, loading, error };
}; 