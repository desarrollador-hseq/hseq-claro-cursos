"use client";

import { useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal, Pencil } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import TableColumnFiltering from "@/components/table-column-filtering";
import { TablePagination } from "./table-pagination";
import { SimpleModal } from "./simple-modal";
import { toast } from "sonner";

import axios from "axios";
import { useRouter } from "next/navigation";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  editHref?: { btnText: string; href: string };
  deleteHref?: string;
  nameDocument?: string;
}

export function ClientTable<TData, TValue>({
  data,
  columns,
  editHref,
  deleteHref,
  nameDocument,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [filtering, setFiltering] = useState("");

  const router = useRouter();
  const [isLoading, setisLoading] = useState(false);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getRowId: (row: any) => row.id,
    onGlobalFilterChange: setFiltering,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter: filtering,
    },
  });

  const onAceptDelete = async (id: string) => {
    setisLoading(true);
    try {
      await axios.delete(`${deleteHref}/${id}`);
      toast.success("Elemento eliminado");
      // router.push("/admin/herramientas/");
      // router.refresh()
    } catch (error) {
      toast.error("ocurrió un error al momento de eliminar el elemento");
    } finally {
      router.refresh();
      setisLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="rounded-t-lg border border-input overflow-hidden">
        <Table className="bg-white">
          <TableHeader className="bg-slate-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-bg-slate-200 hover:bg-bg-slate-200 border-b-2 border-slate-300 shadow-sm"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="py-2 text- bg-slate-200"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {header.column.getCanFilter() ? (
                        <div
                          className=" flex flex-col justify-around "
                          id="non-print"
                        >
                          <TableColumnFiltering
                            column={header.column}
                            table={table}
                          />
                        </div>
                      ) : (
                        <div className="h-6"></div>
                      )}
                    </TableHead>
                  );
                })}
                <TableHead />
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id + index}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}

                  {!!editHref && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-4 w-8 p-0">
                            <span className="sr-only">abrir menu</span>
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="flex flex-col"
                        >
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <Link
                              className="flex justify-center"
                              href={`${editHref.href}/${row.original.id}`}
                            >
                              <Pencil className="w-4 h-4 mr-2" />
                              {editHref.btnText}
                            </Link>
                          </DropdownMenuItem>
                          {!!deleteHref && (
                            <DropdownMenuItem
                              asChild
                              className="cursor-pointer"
                            >
                              <SimpleModal
                                textBtn="eliminar"
                                title="Eliminar el elemento"
                                onAccept={() => onAceptDelete(row.original.id)}
                                large={false}
                              >
                                ¿Desea eliminar el elemento definitivamente?
                              </SimpleModal>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-1 py-2 bg-slate-200">
        <TablePagination table={table} />
      </div>
      {/* {!!nameDocument && <TableToExcel table={table} name={nameDocument} />} */}
    </div>
  );
}
