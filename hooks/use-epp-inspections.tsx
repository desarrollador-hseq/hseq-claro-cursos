import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

// Tipos para las inspecciones EPP
export interface EppInspection {
  id: string;
  status: 'PENDING' | 'VALIDATED' | 'CANCELED';
  inspectionDate: string;
  certificationDate: string;
  collaboratorName: string;
  collaboratorNumDoc: string;
  eppType: string;
  eppName: string;
  eppSerialNumber: string;
  eppBrand: string;
  inspectorName: string;
  isSuitable: boolean;
  validatedBy?: string;
  validatedAt?: string;
  validationNotes?: string;
  observations?: string;
  createdAt: string;
  updatedAt: string;
  regional?: {
    name: string;
  };
}

export interface InspectionStats {
  total: number;
  pending: number;
  validated: number;
  canceled: number;
}

export interface InspectionFilters {
  status?: string;
  search?: string;
  eppType?: string;
  isSuitable?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface InspectionsResponse {
  inspections: EppInspection[];
  pagination: PaginationInfo;
  stats: InspectionStats;
  filters: InspectionFilters;
}

export function useEppInspections() {
  const [inspections, setInspections] = useState<EppInspection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<InspectionStats>({
    total: 0,
    pending: 0,
    validated: 0,
    canceled: 0
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 20,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Función para obtener inspecciones
  const fetchInspections = useCallback(async (
    page: number = 1,
    filters: InspectionFilters = {}
  ) => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
        )
      });

      const response = await fetch(`/api/epp-inspections?${searchParams}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar las inspecciones');
      }

      const data: InspectionsResponse = await response.json();
      
      setInspections(data.inspections);
      setStats(data.stats);
      setPagination(data.pagination);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      toast.error(`Error al cargar inspecciones: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para actualizar el estado de una inspección
  const updateInspectionStatus = useCallback(async (
    inspectionId: string, 
    status: 'PENDING' | 'VALIDATED' | 'CANCELED',
    validationNotes?: string
  ) => {
    try {
      const response = await fetch(`/api/epp-inspections/${inspectionId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status,
          validationNotes
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el estado');
      }

      const data = await response.json();
      
      // Actualizar la inspección en el estado local
      setInspections(prev => 
        prev.map(inspection => 
          inspection.id === inspectionId 
            ? { ...inspection, ...data.inspection }
            : inspection
        )
      );

      // Actualizar estadísticas
      setStats(prev => {
        const newStats = { ...prev };
        
        // Encontrar la inspección original para restar del estado anterior
        const originalInspection = inspections.find(i => i.id === inspectionId);
        if (originalInspection) {
          if (originalInspection.status === 'PENDING') newStats.pending--;
          else if (originalInspection.status === 'VALIDATED') newStats.validated--;
          else if (originalInspection.status === 'CANCELED') newStats.canceled--;
        }
        
        // Sumar al nuevo estado
        if (status === 'PENDING') newStats.pending++;
        else if (status === 'VALIDATED') newStats.validated++;
        else if (status === 'CANCELED') newStats.canceled++;
        
        return newStats;
      });

      toast.success(data.message);
      return data.inspection;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al actualizar estado: ${errorMessage}`);
      throw error;
    }
  }, [inspections]);

  // Función para obtener una inspección específica
  const fetchInspection = useCallback(async (inspectionId: string) => {
    try {
      const response = await fetch(`/api/epp-inspections/${inspectionId}/status`);
      
      if (!response.ok) {
        throw new Error('Error al cargar la inspección');
      }

      const data = await response.json();
      return data.inspection;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al cargar inspección: ${errorMessage}`);
      throw error;
    }
  }, []);

  // Función para refrescar los datos
  const refresh = useCallback(() => {
    fetchInspections(pagination.currentPage);
  }, [fetchInspections, pagination.currentPage]);

  return {
    inspections,
    loading,
    error,
    stats,
    pagination,
    fetchInspections,
    updateInspectionStatus,
    fetchInspection,
    refresh
  };
} 