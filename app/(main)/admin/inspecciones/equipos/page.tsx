"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Users,
  Calendar,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  X,
} from "lucide-react";
import TitlePage from "@/components/title-page";

// Configuración de estados
const STATUS_CONFIG = {
  PENDING: {
    label: "Pendiente",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock,
  },
  APPROVED: {
    label: "Aprobada",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
  },
  REJECTED: {
    label: "Rechazada",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
  },
  CANCELLED: {
    label: "Cancelada",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: X,
  },
};

// Nombres de tipos EPP
const EPP_TYPE_NAMES = {
  ARNES_CUERPO_COMPLETO: "ARNÉS CUERPO COMPLETO",
  ESLINGA_DOBLE_TERMINAL_EN_Y: "ESLINGA DE DOBLE TERMINAL EN Y",
  ESLINGA_POSICIONAMIENTO: "ESLINGA DE POSICIONAMIENTO",
  FRENO_ARRESTADOR_CABLE: "FRENO O ARRESTADOR DE CABLE",
  MOSQUETON: "MOSQUETÓN",
  ANCLAJE_TIPO_TIE_OFF: "ANCLAJE TIPO TIE OFF",
};

interface Inspection {
  id: string;
  collaboratorName: string;
  collaboratorNumDoc: string;
  eppType: string;
  eppName: string;
  inspectorName: string;
  inspectionDate: string;
  isSuitable: boolean;
  status: string;
  sessionId?: string;
  equipmentIndex?: number;
  createdAt: string;
}

interface InspectionGroup {
  sessionId: string;
  inspections: Inspection[];
  totalEquipment: number;
  completedEquipment: number;
  sessionDate: string;
  collaboratorName: string;
  inspectorName: string;
}

export default function EppInspectionsPage() {
  const router = useRouter();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalInspections, setTotalInspections] = useState(0);

  useEffect(() => {
    fetchInspections();
  }, [searchTerm, statusFilter]);

  const fetchInspections = async () => {
    try {
      // Solo enviar filtros de búsqueda y estado, no paginación
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);

      const response = await axios.get(`/api/epp-inspections?${params}`);
      console.log("API Response:", response.data);
      console.log("Response type:", typeof response.data);
      console.log("Is Array:", Array.isArray(response.data));
      
      // Asegurar que response.data sea un array
      let data: Inspection[] = [];
      
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data && Array.isArray(response.data.inspections)) {
        data = response.data.inspections;
      } else if (response.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else {
        console.warn("Unexpected API response format:", response.data);
        data = [];
      }
      
      setInspections(data);
      console.log("Final inspections data:", data);
    } catch (error) {
      console.error("Error fetching inspections:", error);
      setInspections([]);
    } finally {
      setLoading(false);
    }
  };

  // Agrupar inspecciones por sessionId
  const groupedInspections = Array.isArray(inspections) ? inspections.reduce((groups: InspectionGroup[], inspection) => {
    const sessionId = inspection.sessionId || `individual-${inspection.id}`;
    const existingGroup = groups.find(g => g.sessionId === sessionId);
    
    if (existingGroup) {
      existingGroup.inspections.push(inspection);
      existingGroup.totalEquipment = existingGroup.inspections.length;
      existingGroup.completedEquipment = existingGroup.inspections.filter(i => i.status === 'APPROVED').length;
    } else {
      groups.push({
        sessionId,
        inspections: [inspection],
        totalEquipment: 1,
        completedEquipment: inspection.status === 'APPROVED' ? 1 : 0,
        sessionDate: inspection.createdAt,
        collaboratorName: inspection.collaboratorName,
        inspectorName: inspection.inspectorName,
      });
    }
    
    return groups;
  }, []) : [];

  // Filtrar grupos
  const filteredGroups = groupedInspections.filter(group => {
    const matchesSearch = group.inspections.some(inspection =>
      inspection.collaboratorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.collaboratorNumDoc.includes(searchTerm) ||
      inspection.eppName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesStatus = !statusFilter || group.inspections.some(inspection =>
      inspection.status === statusFilter
    );
    
    return matchesSearch && matchesStatus;
  });

  // Aplicar paginación a las sesiones filtradas
  const totalSessions = filteredGroups.length;
  const totalPages = Math.ceil(totalSessions / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedGroups = filteredGroups.slice(startIndex, endIndex);

  const toggleSession = (sessionId: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  const getSessionStatus = (group: InspectionGroup) => {
    const allApproved = group.inspections.every(i => i.status === 'APPROVED');
    const allRejected = group.inspections.every(i => i.status === 'REJECTED');
    const allCancelled = group.inspections.every(i => i.status === 'CANCELLED');
    const hasPending = group.inspections.some(i => i.status === 'PENDING');
    
    if (allApproved) return { label: "Completa", color: "bg-green-100 text-green-800" };
    if (allRejected) return { label: "Rechazada", color: "bg-red-100 text-red-800" };
    if (allCancelled) return { label: "Cancelada", color: "bg-gray-100 text-gray-800" };
    if (hasPending) return { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" };
    return { label: "Mixta", color: "bg-blue-100 text-blue-800" };
  };

  // Funciones de paginación
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setExpandedSessions(new Set()); // Reset expanded sessions on page change
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page
    setExpandedSessions(new Set()); // Reset expanded sessions
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setCurrentPage(1);
    setExpandedSessions(new Set());
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando inspecciones...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <TitlePage
        title="Inspecciones EPP"
        description="Gestión de inspecciones de equipos de protección personal"
      />

      <Card>
        <CardHeader>
          <CardTitle>Inspecciones EPP</CardTitle>
          <CardDescription>
            Gestiona las inspecciones de equipos de protección personal
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por colaborador, documento o equipo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los estados</SelectItem>
                <SelectItem value="PENDING">Pendiente</SelectItem>
                <SelectItem value="APPROVED">Aprobada</SelectItem>
                <SelectItem value="REJECTED">Rechazada</SelectItem>
                <SelectItem value="CANCELLED">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={resetFilters}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Limpiar
            </Button>
          </div>

          {/* Tabla agrupada */}
          <div className="space-y-4">
            {paginatedGroups.map((group) => {
              const sessionStatus = getSessionStatus(group);
              const isExpanded = expandedSessions.has(group.sessionId);
              
              return (
                <div key={group.sessionId} className="border rounded-lg overflow-hidden">
                  {/* Header del grupo */}
                  <div 
                    className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleSession(group.sessionId)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-gray-600" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-600" />
                        )}
                        
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="font-mono text-xs">
                            {group.sessionId.slice(0, 8)}...
                          </Badge>
                          
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{group.collaboratorName}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {group.totalEquipment} equipo{group.totalEquipment !== 1 ? 's' : ''}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {format(new Date(group.sessionDate), "dd/MM/yyyy", { locale: es })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge className={sessionStatus.color}>
                          {sessionStatus.label}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {group.completedEquipment}/{group.totalEquipment} completados
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contenido expandible */}
                  {isExpanded && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Equipo</TableHead>
                          <TableHead>Tipo EPP</TableHead>
                          <TableHead>Inspector</TableHead>
                          <TableHead>Fecha Inspección</TableHead>
                          <TableHead>Aptitud</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.inspections
                          .sort((a, b) => (a.equipmentIndex || 0) - (b.equipmentIndex || 0))
                          .map((inspection) => {
                          const StatusIcon = STATUS_CONFIG[inspection.status as keyof typeof STATUS_CONFIG]?.icon;
                          return (
                            <TableRow key={inspection.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  {inspection.equipmentIndex && (
                                    <Badge variant="secondary" className="text-xs">
                                      #{inspection.equipmentIndex}
                                    </Badge>
                                  )}
                                  {inspection.eppName}
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm">
                                  {EPP_TYPE_NAMES[inspection.eppType as keyof typeof EPP_TYPE_NAMES] ||
                                    inspection.eppType}
                                </span>
                              </TableCell>
                              <TableCell>{inspection.inspectorName}</TableCell>
                              <TableCell>
                                {format(
                                  new Date(inspection.inspectionDate),
                                  "dd/MM/yyyy",
                                  { locale: es }
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={
                                    inspection.isSuitable
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }
                                >
                                  {inspection.isSuitable ? "APTO" : "NO APTO"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={`${
                                    STATUS_CONFIG[inspection.status as keyof typeof STATUS_CONFIG]?.color
                                  } border`}
                                >
                                  {StatusIcon && <StatusIcon className="w-3 h-3 mr-1" />}
                                  {STATUS_CONFIG[inspection.status as keyof typeof STATUS_CONFIG]?.label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    router.push(
                                      `/admin/inspecciones/equipos/gestionar/${inspection.id}`
                                    )
                                  }
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Gestionar
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </div>
              );
            })}
          </div>

          {paginatedGroups.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {filteredGroups.length === 0 
                  ? "No se encontraron inspecciones" 
                  : "No hay sesiones en esta página"
                }
              </p>
            </div>
          )}

          {/* Paginación */}
          {totalSessions > 0 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>
                  Mostrando {((currentPage - 1) * pageSize) + 1} a{" "}
                  {Math.min(currentPage * pageSize, totalSessions)} de{" "}
                  {totalSessions} sesiones
                  {(() => {
                    const totalInspectionsInPage = paginatedGroups.reduce((total, group) => total + group.inspections.length, 0);
                    return ` (${totalInspectionsInPage} inspecciones en esta página)`;
                  })()}
                </span>
                <div className="flex items-center gap-2">
                  <span>Mostrar</span>
                  <Select value={pageSize.toString()} onValueChange={(value) => handlePageSizeChange(Number(value))}>
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span>por página</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
