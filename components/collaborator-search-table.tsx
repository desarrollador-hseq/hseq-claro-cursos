import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  MapPin,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Eye,
  Trash,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { buttonVariants } from "./ui/loading-button";
import { FaIdCard } from "react-icons/fa6";
import { SimpleModal } from "./simple-modal";

interface Collaborator {
  id: string;
  name: string;
  lastname: string;
  numDoc: string;
  city: { realName: string; regional: { name: string } | null } | null;
}

interface SelectedCollaborator extends Collaborator {
  hasCertificate?: boolean;
  certificateType?: "regular" | "cetar";
  certificateMessage?: string;
  certificateId?: string;
}

interface CollaboratorSearchTableProps {
  value?: string[];
  onChange: (ids: string[]) => void;
  selectedCollaborators?: SelectedCollaborator[];
  onRemoveCollaborator?: (id: string) => void;
  loadingCertificates?: boolean;
  excludeCollaboratorIds?: string[];
}

export const CollaboratorSearchTable: React.FC<
  CollaboratorSearchTableProps
> = ({
  value = [],
  onChange,
  selectedCollaborators = [],
  onRemoveCollaborator,
  loadingCertificates,
  excludeCollaboratorIds = [],
}) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState<Collaborator[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter out already selected collaborators and excluded collaborators from search results
  const selectedIds = new Set(selectedCollaborators.map((c) => c.id));
  const excludedIds = new Set(excludeCollaboratorIds);
  const filteredData = data.filter((c) => !selectedIds.has(c.id) && !excludedIds.has(c.id));

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);
    fetch(
      `/api/collaborators?search=${encodeURIComponent(
        search
      )}&page=${page}&pageSize=${pageSize}`
    )
      .then(async (res) => {
        if (!res.ok) throw new Error("Error al cargar colaboradores");
        const json = await res.json();
        if (!ignore) {
          setData(json.data);
          setTotal(json.total);
        }
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [search, page, pageSize]);

  const totalPages = Math.ceil(total / pageSize);

  // Multi-select logic
  const isSelected = (id: string) => value.includes(id);
  const toggleSelect = (id: string) => {
    if (isSelected(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };
  const allOnPageSelected =
    filteredData.length > 0 && filteredData.every((c) => isSelected(c.id));
  const toggleSelectAllOnPage = () => {
    if (allOnPageSelected) {
      onChange(value.filter((id) => !filteredData.some((c) => c.id === id)));
    } else {
      const newIds = filteredData
        .map((c) => c.id)
        .filter((id) => !value.includes(id));
      onChange([...value, ...newIds]);
    }
  };

  const getCertificateStatus = (collaborator: SelectedCollaborator) => {
    if (collaborator.hasCertificate) {
      return {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
        text: collaborator.certificateMessage || "Ya tiene certificado",
        className: "text-red-600 bg-red-50 border-red-200",
        id: collaborator.certificateId,
      };
    }
    return {
      icon: null,
      text: "Disponible para registro",
      className: "text-green-600 bg-green-50 border-green-200",
    };
  };

  return (
    <div className="space-y-4 w-full">
         {/* Selected Collaborators Table */}
      {selectedCollaborators && selectedCollaborators.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-blue-50 px-4 py-2 border-b">
            <h3 className="font-semibold text-blue-900 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Colaboradores Seleccionados ({selectedCollaborators.length})
            </h3>
          </div>
          <div className={` max-h-[200px] overflow-y-auto relative `}>
            {selectedCollaborators.map((collaborator) => {
              const status = getCertificateStatus(collaborator);
              return (
                <div
                  key={collaborator.id}
                  className={cn(
                    "flex items-center gap-2 border-2 px-4 py-1",
                    collaborator.hasCertificate && "bg-red-100 border-red-400"
                  )}
                >
                  <div
                    key={collaborator.id}
                    className={cn(
                      `w-full grid grid-cols-12 gap-2 items-center`
                    )}
                  >
                    <div className="col-span-6">
                      <div className="flex items-center gap-2">
                        {!collaborator.hasCertificate && (
                          <Badge className="bg-green-600 text-white h-5 w-5 flex items-center justify-center">
                            ✓
                          </Badge>
                        )}

                        <div>
                          <p className="font-medium text-gray-900 text-sm md:text-base">
                            {collaborator.name} {collaborator.lastname}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-3">
                      <div className="flex items-center gap-1">
                        <FaIdCard className="h-3 w-3 text-gray-400 hidden md:block" />
                        <p className="text-sm text-gray-600">
                          {collaborator.numDoc}
                        </p>
                      </div>
                    </div>
                    <div className="col-span-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-400 hidden md:block" />
                        <p className="text-sm text-gray-600">
                          {collaborator.city?.realName || "Sin ciudad"}
                        </p>
                      </div>
                    </div>

                    <div className="col-span-12">
                      <div
                        className={cn(
                          "flex justify-between text-red-700 items-center gap-1",
                          !collaborator.hasCertificate &&
                            "text-green-700 font-semibold"
                        )}
                      >
                        <div className="flex items-center justify-start gap-1">
                          <span className="w-4 h-4">{status.icon}</span>
                          <span className="text-xs text-start space-x-2 ">
                            {status.text}

                            {status.id && (
                              <Link
                                target="_blank"
                                href={`/admin/certificados/editar/${status.id}`}
                                className={cn(
                                  buttonVariants({
                                    variant: "outline",
                                    className:
                                      "w-fit h-fit py-0 px-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50",
                                  }),
                                  "px-1 h-fit w-fit inline-block ml-2"
                                )}
                              >
                                <Eye className="h-4 w-4 text-blue-500" />
                              </Link>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="">
                    {onRemoveCollaborator && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => onRemoveCollaborator(collaborator.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}

            {loadingCertificates && (
              <div className="flex items-center justify-center py-8 absolute top-0 left-0 w-full h-full bg-white/50">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-gray-600">
                  Verificando certificados...
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="w-full flex flex-col justify-end relative">
        {/* Search Section */}
        <div className="flex items-center gap-2 mb-3">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre o documento..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="max-w-xs"
          />
          <span className="ml-auto text-xs text-gray-500">
            {loading
              ? "Cargando..."
              : `${filteredData.length} colaboradores disponibles`}
          </span>
        </div>

        {loadingCertificates && (
          <div className="flex items-center justify-center py-8 absolute top-0 left-0 w-full h-full bg-white/70 z-50">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-secondary font-semibold text-lg">
              Verificando...
            </span>
          </div>
        )}

        {/* Search Results Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600 items-center">
              <div className="col-span-1 flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={allOnPageSelected}
                  onChange={toggleSelectAllOnPage}
                  aria-label="Seleccionar todos en la página"
                />
              </div>
              <div className="col-span-4">Nombre</div>
              <div className="col-span-3">Documento</div>
              <div className="col-span-3">Ciudad</div>
              <div className="col-span-1">Regional</div>
            </div>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-gray-600">Cargando colaboradores...</span>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">
                <Users className="h-12 w-12 mx-auto mb-2 text-red-300" />
                <p>{error}</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No hay colaboradores disponibles</p>
                <p className="text-sm">Intenta ajustar la búsqueda</p>
              </div>
            ) : (
              filteredData.map((collaborator) => (
                <div
                  key={collaborator.id}
                  className={cn(
                    "grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-100 cursor-pointer transition-all hover:bg-blue-50 items-center",
                    isSelected(collaborator.id)
                      ? "bg-blue-100 border-blue-200"
                      : "hover:bg-gray-50"
                  )}
                  onClick={() => toggleSelect(collaborator.id)}
                >
                  <div className="col-span-1 flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={isSelected(collaborator.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelect(collaborator.id);
                      }}
                      aria-label="Seleccionar colaborador"
                    />
                  </div>
                  <div className="col-span-4">
                    <div className="flex items-center gap-2">
                      {isSelected(collaborator.id) && (
                        <Badge className="bg-blue-600 text-white h-5 w-5 flex items-center justify-center">
                          ✓
                        </Badge>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {collaborator.name} {collaborator.lastname}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <p className="text-sm text-gray-600">
                      {collaborator.numDoc}
                    </p>
                  </div>
                  <div className="col-span-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        {collaborator.city?.realName || "Sin ciudad"}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-1">
                    <p className="text-sm text-gray-600">
                      {collaborator.city?.regional?.name || "Sin regional"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center justify-between mt-2">
          <div className="text-xs text-gray-500">
            Página {page} de {totalPages || 1}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Siguiente
            </Button>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <span>Mostrar</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="border rounded px-1 py-0.5 text-xs"
            >
              {[10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>por página</span>
          </div>
        </div>
      </div>

     
    </div>
  );
};
