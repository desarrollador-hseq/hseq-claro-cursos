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


export const EmployeeValidationTable = ({
  loadedEmployees,
  handleDeleteCell,
  handleValidationChange,
}: {
  loadedEmployees: unknown[];
  handleDeleteCell: (i: string) => void;
  handleValidationChange: (id: string, isValid: boolean, formData: any) => void;
}) => {


  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombres</TableHead>
          <TableHead>Apellidos</TableHead>
          <TableHead># Documento</TableHead>
          {/* <TableHead>Correo Electrónico</TableHead>
          <TableHead>Teléfono celular</TableHead>
          <TableHead>Sede</TableHead>
          <TableHead>Área</TableHead>
          <TableHead>Cargo</TableHead>
          <TableHead>Tipo de contrato</TableHead> */}
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
            />
          );
        })}
      </TableBody>
      <TableCaption>Total: {loadedEmployees.length}</TableCaption>
    </Table>
  );
};
