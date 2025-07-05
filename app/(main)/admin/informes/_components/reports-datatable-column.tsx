"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Check,
  FileX,
  Link2,
  MoreHorizontal,
  Pencil,
  X,
} from "lucide-react";
import { Report } from "@prisma/client";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenuContent,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";

export const reportColumns: ColumnDef<Report>[] = [
  {
    accessorKey: "deliveryDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha de entrega
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },

    accessorFn: (value) => formatDate(new Date(value.deliveryDate)),
  },

  {
    accessorKey: "conformity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Conformidad
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const getIsConformity = row.getValue("conformity") || "";
      const isConformity = getIsConformity === "Sí";

      return (
        <Badge
          className={cn(
            "bg-red-700 w-8 h-8 rounded-full hover:bg-red-800 p-0",
            isConformity && "bg-emerald-700 hover:bg-emerald-800 p-0"
          )}
        >
          {isConformity ? (
            <Check className="w-4 h-4 mx-auto" />
          ) : (
            <X className="w-5 h-5 mx-auto" />
          )}
        </Badge>
      );
    },
    accessorFn: (value) => {
      if (value.conformity) {
        return "Sí";
      } else {
        return "No";
      }
    },
  },
  {
    accessorKey: "fileUrl",
    header: ({ column }) => {
      return <Button variant="ghost">Archivo</Button>;
    },
    accessorFn: (value) => value.fileUrl,
    cell: ({ row }) => {
      const url = row.original.fileUrl;
      const existUrl = !!url;

      return (
        <Badge
          className={cn(
            "bg-slate-400 hover:bg-slate-500",
            existUrl && "bg-blue-500"
          )}
        >
          {existUrl ? (
            <a
              className={cn(
                buttonVariants({
                  className: "p-0 bg-inherit hover:bg-inherit w-full",
                  variant: "ghost",
                }),
                "h-fit"
              )}
              href={url!}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Link2 className="w-4 h-4" />
            </a>
          ) : (
            <FileX className="w-4 h-4" />
          )}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const { id } = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-4 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Link href={`/admin/informes/${id}`}>
              <DropdownMenuItem>
                <Pencil className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
