"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Course, CourseLevel, RequiredDocument } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Pencil } from "lucide-react";
import { AddLevelForm } from "./add-level-form";

export const levelsDataTableColumns: ColumnDef<
  CourseLevel & { course: Course | null } & {
    requiredDocuments: RequiredDocument[];
  }
>[] = [
  {
    accessorKey: "name",
    accessorFn: (value) => value.name,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "hours",
    enableColumnFilter: false,
    accessorFn: (value) => value.hours,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          # de horas
        </Button>
      );
    },
    cell: ({ row }) => {
      const hours = row.original.hours;
      return <span className="capitalize">{hours || 0}</span>;
    },
  },
  {
    accessorKey: "monthsToExpire",
    enableColumnFilter: false,
    accessorFn: (value) => value.hours,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Meses para expirar
        </Button>
      );
    },
    cell: ({ row }) => {
      const monthsToExpire = row.original.monthsToExpire;
      return <span className="capitalize">{monthsToExpire || "N/A"}</span>;
    },
  },
  {
    accessorKey: "totalDocuments",
    enableColumnFilter: false,
    accessorFn: (value) => value.requiredDocuments.length,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          # Docs requeridos
        </Button>
      );
    },
    cell: ({ row }) => {
      const requiredDocuments = row.original.requiredDocuments;
      return (
        <span className="capitalize">{requiredDocuments.length || 0}</span>
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
            <AddLevelForm
              courseLevel={
                row.original as CourseLevel & { course: Course } & {
                  requiredDocuments: RequiredDocument[];
                }
              }
              course={row.original.course}
              canManagePermissions={true}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
