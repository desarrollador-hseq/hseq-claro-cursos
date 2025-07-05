

"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Certificate, City, Collaborator } from "@prisma/client";
import {
  ArrowUpDown,
  MoreHorizontal,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenuContent,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";



export const certificateDatatableColumn: ColumnDef<
  Certificate & { collaborator: Collaborator & { city: City | null } }
>[] = [
  {
    accessorKey: "collaboratorFullname",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nombres
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const collaborator = row.original?.collaborator;
      return <span className="capitalize">{collaborator?.fullname}</span>;
    },
  },
  {
    accessorKey: "collaboratorNumDoc",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Documento
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const collaborator = row.original?.collaborator;
      return <span className="capitalize">{collaborator?.numDoc}</span>;
    },
  },
  {
    accessorKey: "courseLevelName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nivel
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    accessorFn: (value) => `${value.courseName}`,
    cell: ({ row }) => {
      const courseName = row.original?.courseName || "Desconocido";
      return <span className="capitalize">{courseName}</span>;
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
            <Link href={`/admin/certificados/editar/${id}`}>
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
