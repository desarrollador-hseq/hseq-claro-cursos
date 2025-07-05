"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { City, Collaborator, Course, Training } from "@prisma/client";
import { ArrowUpDown, MoreHorizontal, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenuContent,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const statusColor = {
  PLANNED: "outline",
  IN_PROGRESS: "default",
  COMPLETED: "default",
};

const statusText = {
  PLANNED: "Planificado",
  IN_PROGRESS: "En progreso",
  COMPLETED: "Completado",
};

export const trainingDatatableColumn: ColumnDef<Training & { course: Course }>[] = [
  {
    accessorKey: "code",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Curso
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const { code } = row.original;
      return <span className="capitalize">{code}</span>;
    },
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const startDate = row.original.startDate;
      const formattedDate = formatDate(startDate);
      return <span className="capitalize">{formattedDate}</span>;
    },
  },
  {
    accessorKey: "course",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Curso
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const { course } = row.original;
      return <span className="capitalize">{course.name}</span>;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Estado
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const { status } = row.original;
      return (
        <Badge
          variant={status === "PLANNED" ? "outline" : "default"}
          className="capitalize"
        >
          {statusText[status as keyof typeof statusText]}
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
            <Link href={`/admin/capacitaciones/${id}`}>
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
