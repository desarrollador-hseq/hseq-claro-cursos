"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal, CheckCircle, XCircle, Clock, Pencil } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export interface EppInspection {
  id: string;
  inspectionDate: string;
  certificationDate: string;
  collaboratorName: string;
  collaboratorNumDoc: string;
  collaboratorPosition: string;
  eppType: string;
  eppSerialNumber: string;
  eppBrand: string;
  eppModel: string;
  inspectorName: string;
  isSuitable: boolean;
  status: 'PENDING' | 'VALIDATED' | 'CANCELED';
  observations: string;
  cityName: string;
  createdAt: string;
  updatedAt: string;
}

const EPP_TYPE_NAMES: Record<string, string> = {
  'ARNES_CUERPO_COMPLETO': 'ARNÉS CUERPO COMPLETO',
  'ESLINGA_DOBLE_TERMINAL_EN_Y': 'ESLINGA DE DOBLE TERMINAL EN Y',
  'ESLINGA_POSICIONAMIENTO': 'ESLINGA DE POSICIONAMIENTO',
  'FRENO_ARRESTADOR_CABLE': 'FRENO O ARRESTADOR DE CABLE',
  'MOSQUETON': 'MOSQUETÓN',
  'ANCLAJE_TIPO_TIE_OFF': 'ANCLAJE TIPO TIE OFF'
};

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pendiente',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock
  },
  VALIDATED: {
    label: 'Validado',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle
  },
  CANCELED: {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle
  }
};

export const eppInspectionColumns: ColumnDef<EppInspection>[] = [
  {
    accessorKey: "collaboratorName",
    header: "Colaborador",
    cell: ({ row }) => {
      const inspection = row.original;
      return (
        <div>
          <div className="font-medium">{inspection.collaboratorName}</div>
          <div className="text-sm text-gray-500">{inspection.collaboratorNumDoc}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "collaboratorPosition",
    header: "Cargo",
    cell: ({ row }) => {
      return <span className="text-sm">{row.getValue("collaboratorPosition")}</span>;
    },
  },
  {
    accessorKey: "eppType",
    header: "Tipo EPP",
    cell: ({ row }) => {
      const eppType = row.getValue("eppType") as string;
      return (
        <div>
          <div className="font-medium text-sm">
            {EPP_TYPE_NAMES[eppType] || eppType}
          </div>
          <div className="text-xs text-gray-500">{row.original.eppBrand}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "eppSerialNumber",
    header: "Serie",
    cell: ({ row }) => {
      return <span className="font-mono text-sm">{row.getValue("eppSerialNumber")}</span>;
    },
  },
  {
    accessorKey: "inspectorName",
    header: "Inspector",
    cell: ({ row }) => {
      return <span className="text-sm">{row.getValue("inspectorName")}</span>;
    },
  },
  {
    accessorKey: "inspectionDate",
    header: "Fecha Inspección",
    cell: ({ row }) => {
      const date = new Date(row.getValue("inspectionDate"));
      return (
        <span className="text-sm">
          {format(date, 'dd/MM/yyyy', { locale: es })}
        </span>
      );
    },
  },
  {
    accessorKey: "isSuitable",
    header: "Aptitud",
    cell: ({ row }) => {
      const isSuitable = row.getValue("isSuitable") as boolean;
      return (
        <Badge className={isSuitable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
          {isSuitable ? (
            <>
              <CheckCircle className="w-3 h-3 mr-1" />
              APTO
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3 mr-1" />
              NO APTO
            </>
          )}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as keyof typeof STATUS_CONFIG;
      const StatusIcon = STATUS_CONFIG[status].icon;
      
      return (
        <Badge className={`${STATUS_CONFIG[status].color} border`}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {STATUS_CONFIG[status].label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "cityName",
    header: "Ciudad",
    cell: ({ row }) => {
      return <span className="text-sm">{row.getValue("cityName")}</span>;
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
            <Link href={`/admin/inspecciones/equipos/gestionar/${id}`}>
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
