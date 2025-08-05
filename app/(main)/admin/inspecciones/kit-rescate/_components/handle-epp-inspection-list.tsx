"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  Filter,
  Eye,
  FileUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useEppInspections } from "@/hooks/use-epp-inspections";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import TitlePage from "@/components/title-page";

const EPP_TYPE_NAMES: Record<string, string> = {
  ARNES_CUERPO_COMPLETO: "ARNÉS CUERPO COMPLETO",
  ESLINGA_DOBLE_TERMINAL_EN_Y: "ESLINGA DE DOBLE TERMINAL EN Y",
  ESLINGA_POSICIONAMIENTO: "ESLINGA DE POSICIONAMIENTO",
  FRENO_ARRESTADOR_CABLE: "FRENO O ARRESTADOR DE CABLE",
  MOSQUETON: "MOSQUETÓN",
  ANCLAJE_TIPO_TIE_OFF: "ANCLAJE TIPO TIE OFF",
};

const STATUS_CONFIG = {
  PENDING: {
    label: "Pendiente",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock,
  },
  VALIDATED: {
    label: "Validado",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
  },
  CANCELED: {
    label: "Cancelado",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
  },
};

export function HandleEppInspectionList() {
  const router = useRouter();
  const { inspections, loading, error, stats, pagination, fetchInspections } =
    useEppInspections();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [eppTypeFilter, setEppTypeFilter] = useState<string>("");
  const [suitabilityFilter, setSuitabilityFilter] = useState<string>("");

  // Cargar inspecciones al montar el componente
  useEffect(() => {
    handleSearch();
  }, []);

  // Función para realizar búsqueda con filtros
  const handleSearch = () => {
    const filters: any = {};

    if (searchTerm.trim()) {
      filters.search = searchTerm.trim();
    }
    if (statusFilter) {
      filters.status = statusFilter;
    }
    if (eppTypeFilter) {
      filters.eppType = eppTypeFilter;
    }
    if (suitabilityFilter) {
      filters.isSuitable = suitabilityFilter === "true";
    }

    fetchInspections(1, filters);
  };

  // Función para cambiar página
  const handlePageChange = (page: number) => {
    const filters: any = {};

    if (searchTerm.trim()) filters.search = searchTerm.trim();
    if (statusFilter) filters.status = statusFilter;
    if (eppTypeFilter) filters.eppType = eppTypeFilter;
    if (suitabilityFilter) filters.isSuitable = suitabilityFilter === "true";

    fetchInspections(page, filters);
  };

  // Función para limpiar filtros
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setEppTypeFilter("");
    setSuitabilityFilter("");
    fetchInspections(1, {});
  };

  console.log({ pagination, inspections });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <TitlePage
        title="Gestión de Inspecciones EPP"
        description="Administra todas las inspecciones de equipos de protección personal"
      >
        <div className="flex space-x-3">
          <Button
            onClick={() => router.push("/admin/inspecciones/equipos/generar")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <FileUp className="w-4 h-4 mr-2" />
            Cargar Excel
          </Button>
          <Button onClick={() => router.push("/inspeccion")} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Inspección
          </Button>
        </div>
      </TitlePage>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pending}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Validados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.validated}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cancelados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.canceled}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Input
                placeholder="Buscar por nombre, documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los estados</SelectItem>
                <SelectItem value="PENDING">Pendiente</SelectItem>
                <SelectItem value="VALIDATED">Validado</SelectItem>
                <SelectItem value="CANCELED">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={eppTypeFilter} onValueChange={setEppTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de EPP" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los tipos</SelectItem>
                {Object.entries(EPP_TYPE_NAMES).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={suitabilityFilter}
              onValueChange={setSuitabilityFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Aptitud" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas las aptitudes</SelectItem>
                <SelectItem value="true">Apto</SelectItem>
                <SelectItem value="false">No Apto</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex space-x-2">
              <Button onClick={handleSearch} className="flex-1">
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
              <Button onClick={clearFilters} variant="outline">
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Inspecciones */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Inspecciones</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              <span>Cargando inspecciones...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-red-600">
              <AlertTriangle className="h-6 w-6 mr-2" />
              <span>{error}</span>
            </div>
          ) : inspections.length === 0 ? (
            <div className="text-center py-8">
              <FileUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay inspecciones
              </h3>
              <p className="text-gray-600">
                No se encontraron inspecciones con los filtros aplicados.
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Colaborador</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Tipo EPP</TableHead>
                    <TableHead>Inspector</TableHead>
                    <TableHead>Fecha Inspección</TableHead>
                    <TableHead>Aptitud</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inspections.map((inspection) => {
                    const StatusIcon = STATUS_CONFIG[inspection.status].icon;
                    return (
                      <TableRow key={inspection.id}>
                        <TableCell className="font-medium">
                          {inspection.collaboratorName}
                        </TableCell>
                        <TableCell>{inspection.collaboratorNumDoc}</TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {EPP_TYPE_NAMES[inspection.eppType] ||
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
                              STATUS_CONFIG[inspection.status].color
                            } border`}
                          >
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {STATUS_CONFIG[inspection.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              router.push(
                                `/admin/inspecciones/kit-rescate/gestionar/${inspection.id}`
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

              {/* Paginación */}
              {pagination.totalPages > 0 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-600">
                    Mostrando {(pagination.currentPage - 1) * 10 + 1} a{" "}
                    {Math.min(
                      pagination.currentPage * 10,
                      pagination.totalCount
                    )}{" "}
                    de {pagination.totalCount} resultados
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                      disabled={!pagination.hasPrevPage}
                    >
                      Anterior
                    </Button>
                    <span className="flex items-center px-3 text-sm">
                      Página {pagination.currentPage} de {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                      disabled={!pagination.hasNextPage}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
