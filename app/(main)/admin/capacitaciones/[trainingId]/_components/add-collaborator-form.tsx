"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "sonner";
import {
  UserPlus,
  Search,
  Filter,
  Users,
  MapPin,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";

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
import { cn } from "@/lib/utils";
import { compressAndResizeImage, formatFileSize } from "@/lib/utils";

import { CollaboratorSearchTable } from "@/components/collaborator-search-table";
import { SimpleModal } from "@/components/simple-modal";
import { Collaborator } from "@prisma/client";

interface CourseLevel {
  id: string;
  name: string;
  requiredDocuments: RequiredDocument[];
}

interface RequiredDocument {
  id: string;
  name: string;
}

interface SelectedCollaborator {
  id: string;
  name: string;
  lastname: string;
  numDoc: string;
  city: { realName: string; regional: { name: string } | null } | null;
  hasCertificate?: boolean;
  certificateType?: "regular" | "cetar";
  certificateMessage?: string;
}

interface AddCollaboratorFormProps {
  trainingId: string;
  course: any;
  courseLevel: CourseLevel & { requiredDocuments: RequiredDocument[] };
  maxCapacity: number | null;
  currentCount: number;
  byCetar: boolean;
  currentCollaborators: Collaborator[];
  onSubmitted: () => void;
}

const formSchema = z.object({
  collaboratorsIds: z
    .array(z.string())
    .min(1, "Debe seleccionar al menos un colaborador"),
});

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB en bytes

export const AddCollaboratorForm = ({
  trainingId,
  course,
  courseLevel,
  maxCapacity,
  currentCount,
  byCetar,
  currentCollaborators,
  onSubmitted,
}: AddCollaboratorFormProps) => {
  const router = useRouter();

  const [selectedCollaborators, setSelectedCollaborators] = useState<
    SelectedCollaborator[]
  >([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      collaboratorsIds: [],
    },
  });

  const { isSubmitting, isValid } = form.formState;

  useEffect(() => {
    console.log({
      collaboratorsIds: form.watch(),
      isValid,
      isSubmitting,
      loadingCertificates,
    });
  }, [form.watch()]);

  // Check certificates when collaborators are selected
  const checkCertificates = async (collaboratorIds: string[]) => {
    if (collaboratorIds.length === 0) {
      setSelectedCollaborators([]);
      return;
    }

    setLoadingCertificates(true);
    try {
      const response = await axios.get(
        `/api/trainings/${trainingId}/collaborators`,
        {
          params: {
            collaboratorIds: collaboratorIds.join(","),
            courseLevelId: courseLevel.id,
          },
        }
      );

      const certificateStatus = response.data;

      // Fetch collaborator details for selected IDs
      const collaboratorsResponse = await axios.get(`/api/collaborators`, {
        params: {
          search: "",
          page: 1,
          pageSize: 1000, // Get all to filter
        },
      });

      const allCollaborators = collaboratorsResponse.data.data;
      const selectedCollaboratorsData = allCollaborators
        .filter((c: any) => collaboratorIds.includes(c.id))
        .map((collaborator: any) => {
          const status = certificateStatus.find(
            (s: any) => s.collaboratorId === collaborator.id
          );
          return {
            ...collaborator,
            hasCertificate: status?.hasCertificate || false,
            certificateType: status?.certificateType || null,
            certificateMessage: status?.certificateMessage || "",
            certificateId: status?.certificateId || null,
          };
        });

      setSelectedCollaborators(selectedCollaboratorsData);
    } catch (error) {
      console.error("Error checking certificates:", error);
      toast.error("Error al verificar certificados");
    } finally {
      setLoadingCertificates(false);
    }
  };

  // Handle collaborator selection
  const handleCollaboratorsChange = async (ids: string[]) => {
    setLoadingCertificates(true);
    await checkCertificates(ids);
    form.setValue("collaboratorsIds", ids, { shouldValidate: true });
    setLoadingCertificates(false);
  };

  // Handle removing a collaborator
  const handleRemoveCollaborator = (id: string) => {
    const newIds = form
      .getValues("collaboratorsIds")
      .filter((cId) => cId !== id);
    form.setValue("collaboratorsIds", newIds, { shouldValidate: true });
    setSelectedCollaborators((prev) => prev.filter((c) => c.id !== id));
  };

  useEffect(() => {
    console.log({selectedCollaborators})
  }, [selectedCollaborators])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { data } = await axios.post(
        `/api/trainings/${trainingId}/collaborators`,
        {
          collaboratorsIds: values.collaboratorsIds,
          courseLevelId: courseLevel.id,
        }
      );
      toast(
        <div className="w-full space-y-2 bg-blue-100 opacity-100 ">
          <p className="text-blue-500 font-semibold">Colaboradores agregados</p>
          <span className="flex flex-col border border-green-500 bg-green-500/10 p-2 rounded-sm text-green-700">
            {data.totalRegistered} colaboradores agregados
          </span>
          <span className="flex flex-col border border-red-500 bg-red-500/10 p-2 rounded-sm gap-2 text-red-700">
            {data.totalSkipped} colaboradores no agregados
            {data.skipped.map((s: any) => (
              <p key={s}>
                • {selectedCollaborators.find((c) => c.id === s)?.name}{" "}
                {selectedCollaborators.find((c) => c.id === s)?.lastname}
              </p>
            ))}
          </span>
        </div>,
        {
          className: "bg-blue-100 border border-blue-500 opacity-90",
          duration: 3000,
          position: "top-center",
          style: { zIndex: 100000 },
        }
      );
      if (onSubmitted) {
        onSubmitted();
      }
      form.reset();
      setSelectedCollaborators([]);
    } catch (error) {
      toast.error("Error al agregar colaboradores", {
        duration: 4000,
        position: "top-center",
        style: { zIndex: 100000 },
      });
    }
  };

  const isAtCapacity = maxCapacity ? currentCount >= maxCapacity : false;

  return (
    <div className="space-y-6 flex flex-col justify-end">
      {isAtCapacity ? (
        <div className="text-center py-6">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 font-medium">
            Capacidad máxima alcanzada
          </p>
          <p className="text-sm text-gray-500">
            No se pueden agregar más colaboradores
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="collaboratorsIds"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <CollaboratorSearchTable
                        value={field.value}
                        onChange={handleCollaboratorsChange}
                        selectedCollaborators={selectedCollaborators}
                        onRemoveCollaborator={handleRemoveCollaborator}
                        loadingCertificates={loadingCertificates}
                        excludeCollaboratorIds={currentCollaborators?.map(c => c.id) || []}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <LoadingButton
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !isValid ||
                    loadingCertificates ||
                    selectedCollaborators.length === 0
                  }
                  loading={isSubmitting}
                  className="w-fit bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Guardar Colaboradores
                </LoadingButton>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
};
