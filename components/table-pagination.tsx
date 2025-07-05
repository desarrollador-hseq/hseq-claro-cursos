"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Table } from "@tanstack/react-table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface TablePaginationProps<TData> {
  table: Table<TData>;
}

export function TablePagination<TData>({ table }: TablePaginationProps<TData>) {
  const { pageSize, pageIndex } = table.getState().pagination;
  const total = table.getFilteredRowModel().rows.length;

  const startIndex = pageIndex * pageSize + 1;
  const endIndex = Math.min(startIndex + pageSize - 1, table.getRowCount());
  // console.log({ pagecount: table.getPageCount(), pageSize });
  return (
    <div className="flex items-center justify-between px-2 mt-3 w-full">
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-xs font- text-slate-500">Registros por páginas</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-6 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 15, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="flex w-[100px] items-center justify-center text-xs font- text-slate-500">
          Página {pageIndex + 1} de {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <Button
            variant="outline"
            className="hidden h-6 w-6 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Ir a la primera página</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-6 w-6 p-0 text-xs"
            onClick={() => {
              console.log("Página Anterior", pageIndex);
              table.previousPage();
            }}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Ir a la anterior página</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-6 w-6 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Ir a la siguiente página</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-6 w-6 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Ir a la última página</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="text-xs text-muted-foreground text-end">
        {total !== 0 &&
          `(${
            startIndex === endIndex ? startIndex : `${startIndex} - ${endIndex}`
          }) de ${table.getRowCount()} ${
            table.getRowCount() === 1 ? "registro" : "registros"
          }`}
      </div>
    </div>
  );
}
