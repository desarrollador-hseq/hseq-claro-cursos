"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import { UserPlus, Search, Filter, Users, MapPin, CheckCircle, AlertCircle, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LoadingButton } from "@/components/ui/loading-button";
import { compressAndResizeImage, formatFileSize } from "@/lib/utils";

interface AddCollaboratorFormProps {
  trainingId: string;
  course: any;
  availableCollaborators: any[];
  maxCapacity: number | null;
  currentCount: number;
}

const formSchema = z.object({
  collaboratorId: z.string().min(1, "Debe seleccionar un colaborador"),
  courseLevelId: z.string().min(1, "Debe seleccionar un nivel"),
  documents: z.record(z.object({
    file: z.any().optional(),
    fileName: z.string().optional(),
    uploaded: z.boolean().default(false)
  })).optional()
});

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB en bytes

export const AddCollaboratorForm = ({
  trainingId,
  course,
  availableCollaborators,
  maxCapacity,
  currentCount
}: AddCollaboratorFormProps) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedRegional, setSelectedRegional] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<any>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<{[key: string]: File}>({});
  const [fileErrors, setFileErrors] = useState<{[key: string]: string}>({});

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      collaboratorId: "",
      courseLevelId: "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const validateFileSize = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `El archivo es demasiado grande. Tamaño máximo permitido: 2MB. Tamaño actual: ${(file.size / 1024 / 1024).toFixed(2)}MB`;
    }
    return null;
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Validar que todos los documentos requeridos estén subidos
      if (selectedLevel && selectedLevel.requiredDocuments.length > 0) {
        const missingDocs = selectedLevel.requiredDocuments.filter(
          (doc: any) => !uploadedDocuments[doc.id]
        );
        
        if (missingDocs.length > 0) {
          toast.error("Debes subir todos los documentos requeridos antes de matricular");
          return;
        }

        // Validar que no haya errores de tamaño de archivo
        const hasFileErrors = Object.keys(fileErrors).some(key => fileErrors[key]);
        if (hasFileErrors) {
          toast.error("Hay archivos con errores de tamaño. Por favor corrígelos antes de continuar");
          return;
        }
      }

      // Crear FormData para enviar archivos
      const formData = new FormData();
      formData.append('collaboratorId', values.collaboratorId);
      formData.append('courseLevelId', values.courseLevelId);
      
      // Agregar documentos al FormData
      selectedLevel?.requiredDocuments.forEach((doc: any) => {
        const file = uploadedDocuments[doc.id];
        if (file) {
          formData.append(`documents[${doc.id}]`, file);
        }
      });

      await axios.post(`/api/trainings/${trainingId}/collaborators`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success("Colaborador agregado exitosamente", {
        duration: 3000, 
        position: "top-center",
      
        style: {
          zIndex: 100000
        }
        
      });
      form.reset();
      setSelectedLevel(null);
      setUploadedDocuments({});
      setFileErrors({});
      router.refresh();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.data === "Collaborator already registered") {
          toast.error("El colaborador ya está registrado en esta capacitación", {
            duration: 3000, 
            position: "top-center",
            style: {
              zIndex: 100000
            }
          });
        } else if (error.response?.data === "Training is at maximum capacity") {
          toast.error("La capacitación ha alcanzado su capacidad máxima", {
            duration: 3000, 
            position: "top-center",
            style: {
              zIndex: 100000
            }
          });
        } else {
          toast.error("Error al agregar colaborador", {
            duration: 3000, 
            position: "top-center",
            style: {
              zIndex: 100000
            }
          });
        }
      } else {
        toast.error("Ocurrió un error inesperado", {
          duration: 3000, 
          position: "top-center",
          style: {
            zIndex: 100000
          }
        });
      }
    }
  };

  // Filtrar colaboradores
  const filteredCollaborators = availableCollaborators.filter(collaborator => {
    // Verificar que el colaborador tenga un ID válido
    if (!collaborator.id || collaborator.id.trim() === "") return false;
    
    const matchesSearch = collaborator.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         collaborator.numDoc?.includes(searchTerm);
    const matchesCity = selectedCity === "all" || collaborator.city?.id === selectedCity;
    const matchesRegional = selectedRegional === "all" || collaborator.city?.regional?.id === selectedRegional;
    
    return matchesSearch && matchesCity && matchesRegional;
  });

  // Obtener regionales y ciudades únicas
  const regionals = Array.from(new Map(
    availableCollaborators
      .filter(c => c.city?.regional && c.city.regional.id) // Verificar que el ID exista
      .map(c => [c.city!.regional!.id, c.city!.regional!])
  ).values()).filter(regional => regional.id && regional.id.trim() !== ""); // Filtrar IDs válidos

  const cities = Array.from(new Map(
    availableCollaborators
      .filter(c => c.city && c.city.id && (selectedRegional === "all" || c.city.regional?.id === selectedRegional)) // Verificar que el ID exista
      .map(c => [c.city!.id, c.city!])
  ).values()).filter(city => city.id && city.id.trim() !== ""); // Filtrar IDs válidos

  const isAtCapacity = maxCapacity !== null && currentCount >= maxCapacity;

  // Verificar si todos los archivos están subidos y sin errores
  const hasAllValidFiles = selectedLevel && selectedLevel.requiredDocuments.length > 0 
    ? selectedLevel.requiredDocuments.every((doc: any) => 
        uploadedDocuments[doc.id] && !fileErrors[doc.id]
      )
    : true;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Agregar Colaborador
        </CardTitle>
        {maxCapacity && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            {currentCount} / {maxCapacity} cupos ocupados
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {isAtCapacity ? (
          <div className="text-center py-6">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 font-medium">Capacidad máxima alcanzada</p>
            <p className="text-sm text-gray-500">
              No se pueden agregar más colaboradores
            </p>
          </div>
        ) : (
          <>
            {/* Filtros */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Filter className="h-4 w-4" />
                Filtros
              </div>
              
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Regional</label>
                  <Select
                    value={selectedRegional}
                    onValueChange={(value) => {
                      setSelectedRegional(value);
                      setSelectedCity("all"); // Reset city filter
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las regionales" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las regionales</SelectItem>
                      {regionals.map((regional) => (
                        <SelectItem key={regional.id} value={regional.id}>
                          {regional.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Ciudad</label>
                  <Select
                    value={selectedCity}
                    onValueChange={setSelectedCity}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las ciudades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las ciudades</SelectItem>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.realName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre o documento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {(searchTerm || selectedCity !== "all" || selectedRegional !== "all") && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {filteredCollaborators.length} colaboradores encontrados
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCity("all");
                      setSelectedRegional("all");
                    }}
                  >
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Formulario */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="collaboratorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Colaborador</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un colaborador" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[200px]">
                          {filteredCollaborators.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                              No hay colaboradores disponibles
                            </div>
                          ) : (
                            filteredCollaborators.map((collaborator) => (
                              <SelectItem key={collaborator.id} value={collaborator.id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{collaborator.fullname}</span>
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span>{collaborator.numDoc}</span>
                                    {collaborator.city && (
                                      <>
                                        <span>•</span>
                                        <div className="flex items-center gap-1">
                                          <MapPin className="h-3 w-3" />
                                          {collaborator.city.realName}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="courseLevelId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Nivel del Curso</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          const level = course.courseLevels.find((l: any) => l.id === value);
                          setSelectedLevel(level);
                          setUploadedDocuments({}); // Reset documents when level changes
                          setFileErrors({}); // Reset file errors when level changes
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el nivel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {course.courseLevels
                            .filter((level: any) => level.id && level.id.trim() !== "")
                            .map((level: any) => (
                            <SelectItem key={level.id} value={level.id}>
                              <div className="flex items-center justify-between w-full">
                                <div>
                                  <span className="font-medium">{level.name}</span>
                                  <div className="text-xs text-gray-500">
                                    {level.hours} horas • {level.requiredDocuments.length} documentos
                                  </div>
                                </div>
                                <Badge variant="secondary" className="ml-2">
                                  {level.requiredDocuments.length}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Sección de documentos requeridos */}
                {selectedLevel && selectedLevel.requiredDocuments.length > 0 && (
                  <div className="space-y-4">
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-semibold mb-3">
                        Documentos Requeridos ({selectedLevel.requiredDocuments.length})
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Debes subir todos los documentos antes de matricular al colaborador (máximo 2MB por archivo)
                      </p>
                      
                      <div className="grid gap-4">
                        {selectedLevel.requiredDocuments.map((doc: any) => (
                          <div key={doc.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{doc.name}</h4>
                              {fileErrors[doc.id] ? (
                                <Badge variant="destructive">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Error
                                </Badge>
                              ) : uploadedDocuments[doc.id] ? (
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Subido
                                </Badge>
                              ) : (
                                <Badge variant="destructive">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Requerido
                                </Badge>
                              )}
                            </div>
                            
                            {doc.description && (
                              <p className="text-sm text-gray-600 mb-3">{doc.description}</p>
                            )}
                            
                            <div className="flex items-center gap-2">
                              <Input
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const processFile = (processedFile: File) => {
                                      const error = validateFileSize(processedFile);
                                      if (error) {
                                        setFileErrors(prev => ({
                                          ...prev,
                                          [doc.id]: error
                                        }));
                                        // Remover el archivo si hay error
                                        setUploadedDocuments(prev => {
                                          const newDocs = { ...prev };
                                          delete newDocs[doc.id];
                                          return newDocs;
                                        });
                                      } else {
                                        setFileErrors(prev => {
                                          const newErrors = { ...prev };
                                          delete newErrors[doc.id];
                                          return newErrors;
                                        });
                                        setUploadedDocuments(prev => ({
                                          ...prev,
                                          [doc.id]: processedFile
                                        }));
                                      }
                                    };

                                    // Comprimir imagen si es necesario
                                    if (file.type.startsWith('image/')) {
                                      console.log('🖼️ Imagen detectada en AddCollaboratorForm:', file.name, file.type);
                                      
                                      toast.loading(`Comprimiendo imagen: ${file.name}...`, {
                                        id: `compress-${doc.id}`
                                      });

                                      compressAndResizeImage(
                                        file,
                                        (compressedFile) => {
                                          console.log('✅ Compresión completada en AddCollaboratorForm');
                                          toast.dismiss(`compress-${doc.id}`);
                                          
                                          // Mostrar resultado de compresión
                                          const originalSize = formatFileSize(file.size);
                                          const compressedSize = formatFileSize(compressedFile.size);
                                          const reduction = Math.round(((file.size - compressedFile.size) / file.size) * 100);
                                          
                                          if (compressedFile.size < file.size) {
                                            toast.success(`Imagen comprimida: ${originalSize} → ${compressedSize} (${reduction}% reducción)`, {
                                              duration: 5000
                                            });
                                          } else {
                                            toast.info(`Imagen ya optimizada: ${originalSize}`, {
                                              duration: 3000
                                            });
                                          }
                                          
                                          processFile(compressedFile);
                                        },
                                        (error) => {
                                          console.error('❌ Error en compresión AddCollaboratorForm:', error);
                                          toast.dismiss(`compress-${doc.id}`);
                                          toast.error('Error al comprimir la imagen. Usando archivo original.');
                                          
                                          // Usar archivo original si falla compresión
                                          processFile(file);
                                        }
                                      );
                                    } else {
                                      // Para archivos no-imagen, procesar directamente
                                      processFile(file);
                                    }
                                  }
                                }}
                                className="flex-1"
                              />
                              {uploadedDocuments[doc.id] && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setUploadedDocuments(prev => {
                                      const newDocs = { ...prev };
                                      delete newDocs[doc.id];
                                      return newDocs;
                                    });
                                    setFileErrors(prev => {
                                      const newErrors = { ...prev };
                                      delete newErrors[doc.id];
                                      return newErrors;
                                    });
                                  }}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            
                            {/* Mostrar error de tamaño */}
                            {fileErrors[doc.id] && (
                              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                                {fileErrors[doc.id]}
                              </div>
                            )}
                            
                            {uploadedDocuments[doc.id] && !fileErrors[doc.id] && (
                              <p className="text-xs text-gray-500 mt-1">
                                Archivo: {uploadedDocuments[doc.id].name} ({(uploadedDocuments[doc.id].size / 1024 / 1024).toFixed(2)}MB)
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Progreso de documentos */}
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">
                            Progreso: {Object.keys(uploadedDocuments).length} / {selectedLevel.requiredDocuments.length}
                          </span>
                          <span className={`${
                            hasAllValidFiles
                              ? 'text-green-600' : 'text-orange-600'
                          }`}>
                            {hasAllValidFiles
                              ? 'Todos los documentos subidos ✓' 
                              : `Faltan ${selectedLevel.requiredDocuments.length - Object.keys(uploadedDocuments).length} documentos`
                            }
                          </span>
                        </div>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${(Object.keys(uploadedDocuments).length / selectedLevel.requiredDocuments.length) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <LoadingButton
                  type="submit"
                  disabled={
                    isSubmitting || 
                    !isValid || 
                    filteredCollaborators.length === 0 ||
                    !hasAllValidFiles
                  }
                  loading={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {selectedLevel && selectedLevel.requiredDocuments.length > 0 
                    ? `Matricular con ${selectedLevel.requiredDocuments.length} documentos`
                    : "Agregar Colaborador"
                  }
                </LoadingButton>
              </form>
            </Form>
          </>
        )}
      </CardContent>
    </Card>
  );
}; 