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
  VALIDATED: {
    label: "Aprobada",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
  },
  // REJECTED: {
  //   label: "Rechazada",
  //   color: "bg-red-100 text-red-800 border-red-200",
  //   icon: XCircle,
  // },
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
  cityName?: string; // Added for city filter
  collaboratorCityName?: string; // Added for city filter
}

export default function EppInspectionsPage() {
  const router = useRouter();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });

  useEffect(() => {
    fetchInspections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, cityFilter, dateFilter, currentPage, pageSize]);

  const fetchInspections = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter && statusFilter !== "ALL")
        params.append("status", statusFilter);
      if (cityFilter) params.append("search", cityFilter); // Backend only supports one 'search', so combine in UI
      if (dateFilter) params.append("search", dateFilter); // Same as above
      params.append("page", currentPage.toString());
      params.append("limit", pageSize.toString());
      const response = await axios.get(`/api/epp-inspections?${params}`);
      const data = response.data;
      setInspections(data.inspections || []);
      console.log({ data });
      setPagination(
        data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          limit: 10,
          hasNextPage: false,
          hasPrevPage: false,
        }
      );
    } catch (error) {
      console.error("Error fetching inspections:", error);
      setInspections([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setCityFilter("");
    setDateFilter("");
    setCurrentPage(1);
  };

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
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por colaborador, documento, equipo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Input
              placeholder="Ciudad"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="min-w-[150px]"
            />
            <Input
              type="date"
              placeholder="Fecha de inspección"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="min-w-[170px]"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los estados</SelectItem>
                <SelectItem value="PENDING">Pendiente</SelectItem>
                <SelectItem value="VALIDATED">Validada</SelectItem>
                <SelectItem value="CANCELED">Cancelada</SelectItem>
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

          {/* Tabla plana */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipo</TableHead>
                  <TableHead>Colaborador</TableHead>
       
                  <TableHead>Inspector</TableHead>
                  <TableHead>Fecha Inspección</TableHead>
                  <TableHead>Ciudad</TableHead>
                  <TableHead>Aptitud</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="container mx-auto py-6">
                        <div className="flex items-center justify-center py-12">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-gray-600">
                              Cargando inspecciones...
                            </p>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : inspections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        No se encontraron inspecciones
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  inspections.map((inspection) => {
                    const StatusIcon =
                      STATUS_CONFIG[
                        inspection.status as keyof typeof STATUS_CONFIG
                      ]?.icon;
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
                          <div className="flex flex-col items-center gap-2 text-xs">
                            <span className="text-sm">
                              {inspection.collaboratorName}
                            </span>
                            <span className="text-sm">
                              {inspection.collaboratorNumDoc}
                            </span>
                          </div>
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
                          {(inspection as any).collaboratorCityName || "-"}
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
                              STATUS_CONFIG[
                                inspection.status as keyof typeof STATUS_CONFIG
                              ]?.color
                            } border`}
                          >
                            {StatusIcon && (
                              <StatusIcon className="w-3 h-3 mr-1" />
                            )}
                            {
                              STATUS_CONFIG[
                                inspection.status as keyof typeof STATUS_CONFIG
                              ]?.label
                            }
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
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>
                  Mostrando{" "}
                  {(pagination.currentPage - 1) * pagination.limit + 1} a{" "}
                  {Math.min(
                    pagination.currentPage * pagination.limit,
                    pagination.totalCount
                  )}{" "}
                  de {pagination.totalCount} inspecciones
                </span>
                <div className="flex items-center gap-2">
                  <span>Mostrar</span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) =>
                      handlePageSizeChange(Number(value))
                    }
                  >
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
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  Anterior
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (
                        pagination.currentPage >=
                        pagination.totalPages - 2
                      ) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={
                            pagination.currentPage === pageNum
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
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
