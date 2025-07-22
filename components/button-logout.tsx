"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LogOut } from "lucide-react";

export const ButtonLogout = ({
  text,
  className,
}: {
  text?: string;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);

  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/");
    },
  });

  useEffect(() => {
    if (status !== "loading") {
      if (status !== "authenticated") {
        redirect("/");
      }
    }
  }, [status]);

  const onClickAcept = async () => {
    try {
      await signOut({
        callbackUrl: "/auth",
        redirect: true,
      });
    } catch (error) {
    } finally {
    }
    // await logout();
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild className="p-0 m-0">
        <div
          className={cn(
            buttonVariants(),
            "rounded- w-fit cursor-pointer m-0 h-8 bg-slate-100 hover:bg-slate-100 text-red-600 border border-slate-300",
            className
          )}
        >
          {text ? text : "Salir"}
          <LogOut className="w-4 h-4 ml-2" />
        </div>
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-[600px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl">
            <div className="flex justify-between">Cerrar sesión</div>
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription className="w-full"></AlertDialogDescription>
        <span className="w-full">¿Está seguro que desea cerrar sesión?</span>
        <AlertDialogFooter className="gap-3">
          <Button
            className="bg-zinc-400 hover:bg-zinc-600"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>

          <Button onClick={onClickAcept}>Aceptar</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
