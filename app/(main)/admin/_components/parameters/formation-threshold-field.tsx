"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { Pencil, X } from "lucide-react";
import { FormationParameters } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FormationThresholdFieldProps {
  formationParameters: FormationParameters | null;
}

const formSchema = z.object({
  threshold: z.coerce.number(),
});

export const FormationThresholdField = ({
  formationParameters,
}: FormationThresholdFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const toggleEdit = () => setIsEditing((current) => !current);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      threshold: formationParameters?.threshold || 0,
    },
  });
  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log({ formationParameters });
    try {
      if (!formationParameters) {
        await axios.post(`/api/parameters/formation`, values);
      } else {
        await axios.patch(
          `/api/parameters/formation/${formationParameters?.id}`,
          values
        );
      }

      toast.success("Porcentaje actualizado");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Ocurrió un error inesperado");
    }
  };

  return (
    <div className="mt-6 border bg-slate-200 rounded-md p-4 text-zinc-800">
      <div className="font-medium flex items-center justify-between">
        Porcentaje
        <Button
          onClick={toggleEdit}
          variant="default"
          className="bg-slate-500 hover:bg-slate-700"
        >
          {isEditing ? (
            <>
              <X className="h-5 w-5 " />
            </>
          ) : (
            <>
              <Pencil className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <p
          className={cn(
            "text-md font-bold mt-2",
            !formationParameters?.threshold && "text-slate-500 italic"
          )}
        >
          {formationParameters ? formationParameters.threshold : 0}
        </p>
      )}
      {isEditing && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <FormField
              control={form.control}
              name="threshold"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      disabled={isSubmitting}
                      placeholder=""
                      className="bg-slate-300 text-zinc-900 font-bold text-md"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-x-2">
              <Button
                disabled={!isValid || isSubmitting}
                className="bg-secondary"
                type="submit"
              >
                Actualizar
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
