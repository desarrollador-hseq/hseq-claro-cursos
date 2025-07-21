"use client"
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmployeeValidationDataRow } from "./employee-validation-data-row";
import { City } from "@prisma/client";


export const EmployeeValidationTable = ({
  loadedEmployees,
  handleDeleteCell,
  handleValidationChange,
  cities,
  employeeErrors = {},
}: {
  loadedEmployees: unknown[];
  handleDeleteCell: (i: string) => void;
  handleValidationChange: (id: string, isValid: boolean, formData: any) => void;
  cities: City[];
  employeeErrors?: Record<string, string>;
}) => {


  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombres</TableHead>
          <TableHead>Apellidos</TableHead>
          <TableHead>Tipo de documento</TableHead>
          <TableHead># Documento</TableHead>
          <TableHead>Correo electrónico</TableHead>
          <TableHead>Ciudad</TableHead>
          <TableHead>Acción</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loadedEmployees.map((row: any) => {
          // if (index === 0) return;
          return (
            <EmployeeValidationDataRow
              key={row.id}
              row={row}
              deleteCell={handleDeleteCell}
              onValidationChange={handleValidationChange}
              cities={cities}
              apiError={employeeErrors[row.identificationNumber]}
            />
          );
        })}
      </TableBody>
      <TableCaption>Total: {loadedEmployees.length}</TableCaption>
    </Table>
  );
};
