"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenuContent,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { AdminOnly } from "@/components/rbac-wrapper";

interface RegionalTableProps {
  id?: string | null;
  name?: string | null;
}

type RegionalTableType = RegionalTableProps;

export const regionalColumns: ColumnDef<RegionalTableType>[] = [
  {
    accessorKey: "name",
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
    accessorFn: (value) => `${value.name}`,
    cell: ({ row }) => {
      const name = row.original.name;
      const cityName = name || "No especificado";
      return <span className="capitalize">{cityName}</span>;
    },
  },
  {
    id: "actions",
    header: "Acción",
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
            <AdminOnly>
              <Link href={`/admin/regionales/${id}`}>
                <DropdownMenuItem>
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
              </Link>
            </AdminOnly>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
