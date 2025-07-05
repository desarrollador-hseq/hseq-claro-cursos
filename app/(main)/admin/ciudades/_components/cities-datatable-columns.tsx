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
import { Regional } from "@prisma/client";
import { AdminOnly } from "@/components/rbac-wrapper";

interface CityTableProps {
  id: string;
  realName: string;
  regional: Regional | null;
}

type CityTableType = CityTableProps;

export const citiesColumns: ColumnDef<CityTableType>[] = [
  {
    accessorKey: "realName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Ciudad
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    accessorFn: (value) => `${value.realName}`,
    cell: ({ row }) => {
      const name = row.original.realName;
      const cityName = name || "No especificado";
      return <span className="capitalize">{cityName}</span>;
    },
  },
  {
    id: "regional",
    accessorKey: "regional",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Regional
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    accessorFn: (value) =>
      `${value.regional?.name ? value.regional?.name : "No especificado"}`,
    cell: ({ row }) => {
      const regional = row.original.regional && row.original.regional;
      const regionalName = regional?.name || "No especificado";
      return <span className="capitalize">{regionalName}</span>;
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
              <Link href={`/admin/ciudades/${id}`}>
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
