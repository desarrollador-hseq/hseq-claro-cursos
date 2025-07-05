"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Edit3, TrendingUp, Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingButton } from "@/components/ui/loading-button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const scoreSchema = z.object({
  finalScore: z
    .number()
    .min(0, "La nota debe ser mayor o igual a 0")
    .max(100, "La nota debe ser menor o igual a 100"),
});

type ScoreFormValues = z.infer<typeof scoreSchema>;

interface EditScoreModalProps {
  collaborator: any;
  trainingId: string;
  threshold: number;
  onUpdate?: () => void;
  isAdmin: boolean;
  isDisabled: boolean;
}

export const EditScoreModal = ({
  collaborator,
  trainingId,
  threshold,
  onUpdate,
  isAdmin,
  isDisabled,
}: EditScoreModalProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ScoreFormValues>({
    resolver: zodResolver(scoreSchema),
    defaultValues: {
      finalScore: collaborator.finalScore || 0,
    },
  });

  const onSubmit = async (values: ScoreFormValues) => {
    setIsSubmitting(true);
    try {
      await axios.put(
        `/api/trainings/${trainingId}/collaborators/${collaborator.collaboratorId}/score`,
        values
      );

      toast.success("Nota actualizada exitosamente");
      setIsOpen(false);
      if (onUpdate) onUpdate();
      router.refresh();
    } catch (error) {
      console.error("Error updating score:", error);
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Error al actualizar la nota"
        );
      } else {
        toast.error("Error inesperado al actualizar la nota");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentScore = form.watch("finalScore");
  const isPassing = currentScore >= threshold;

  console.log({ tccollaborator: collaborator });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        asChild
        disabled={isAdmin ? false : isDisabled || collaborator.certificateIssued}
      >
        <Button
          variant="outline"
          size="sm"
          className="h-6 w-6 p-0 text-slate-500 hover:text-slate-700 "
          disabled={isAdmin ? false : isDisabled || collaborator.certificateIssued}
        >
          <TrendingUp className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-slate-600" />
            Editar Nota Final
          </DialogTitle>
          <DialogDescription>
            Asignar nota final al colaborador{" "}
            <strong>{collaborator.collaborator.fullname}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información del colaborador */}
          <Card className="border-slate-200">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-semibold">
                  {collaborator.collaborator.fullname.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">
                    {collaborator.collaborator.fullname}
                  </p>
                  <p className="text-sm text-slate-600">
                    {collaborator.collaborator.numDoc} •{" "}
                    {collaborator.courseLevel.name}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs bg-slate-50">
                      Nota mínima: {threshold}%
                    </Badge>
                    {collaborator.finalScore !== null && (
                      <Badge
                        variant={
                          collaborator.finalScore >= threshold
                            ? "default"
                            : "destructive"
                        }
                        className="text-xs"
                      >
                        Actual: {collaborator.finalScore}%
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulario */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="finalScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="finalScore">
                      Nota Final (0-100)
                    </FormLabel>
                    <FormControl>
                      <Slider
                        id="finalScore"
                        defaultValue={[field.value]}
                        max={100}
                        step={10}
                        className={cn("w-full accent-slate-100")}
                        onValueChange={(vals) => {
                          field.onChange(vals[0]);
                        }}
                        color="red"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Indicador visual */}
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">
                      Estado de la evaluación
                    </p>
                    <p className="text-sm text-slate-600">
                      {isPassing
                        ? `Nota suficiente para certificar (≥${threshold}%)`
                        : `Nota insuficiente para certificar (<${threshold}%)`}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-700">
                      {currentScore}%
                    </div>
                    <Badge
                      variant={isPassing ? "default" : "destructive"}
                      className="text-xs mt-1"
                    >
                      {isPassing ? "Aprobado" : "Reprobado"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <LoadingButton
                  type="submit"
                  loading={isSubmitting}
                  className="bg-slate-900 hover:bg-slate-800"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Nota
                </LoadingButton>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
