"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as z from "zod";
import axios from "axios";
import { Link, Pencil, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ArchivesLinkFormProps {
  archivesLink?: string | null;
  collaboratorId: string;
}

const formSchema = z.object({
  archivesLink: z.string().min(1, {
    message: "Link es requerido",
  }),
});

export const ArchivesLinkForm = ({
  archivesLink,
  collaboratorId,
}: ArchivesLinkFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const toggleEdit = () => setIsEditing((current) => !current);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      archivesLink: archivesLink || "",
    },
  });
  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/collaborators/${collaboratorId}`, values);
      toast.success("Course updated");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <Card className="mt-6 bg-slate-200 rounded-md p-1 border border-primary/20 overflow-hidden">
      <CardHeader className="bg-slate-100 rounded-sm shadow-sm border border-slate-300">
        <div className="font-medium flex items-center justify-between">
          <h3 className="font-semibold text-lg text-primary/80 ml-2">
            Link de evidencias
          </h3>

          <Button
            onClick={toggleEdit}
            variant="secondary"
            className={cn(
              "text-white mr-2",
              isEditing && "bg-slate-500 hover:bg-slate-700"
            )}
          >
            {isEditing && <>Cancelar</>}
            {!isEditing && !archivesLink && (
              <>
                <PlusCircle className="h-4 w-4 mr-2" />
                Agregar
              </>
            )}
            {!isEditing && archivesLink && (
              <>
                <Pencil className="h-4 w-4 mr-2" />
                Actualizar
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      {!isEditing &&
        (!archivesLink ? (
          <div className="h-16 flex items-center justify-center bg-slate-200 rounded-md">
            <Link className="w-10 h-10 text-slate-500" />
          </div>
        ) : (
          <div className="h-16 flex items-center justify-center">
            <a href={archivesLink} target="_blank" rel="noreferrer">
              <p className="font-bold text-blue-500 flex gap-2">
                {archivesLink}
                <Link className="text-blue-5000" />
              </p>
            </a>
          </div>
        ))}
      {isEditing && (
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 mt-4"
            >
              <FormField
                control={form.control}
                name="archivesLink"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        className="bg-white "
                        disabled={isSubmitting}
                        placeholder="https://google.drive.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="w-full flex items-center justify-end">
                <Button disabled={!isValid || isSubmitting} type="submit">
                  Guardar link
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </Card>
  );
};
