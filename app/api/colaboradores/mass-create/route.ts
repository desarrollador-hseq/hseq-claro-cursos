import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { DocType } from "@prisma/client";

interface EmployeeInput {
  name: string;
  lastName: string;
  identificationNumber: string;
  docType: DocType;
  cityId: string; // Cambiado de city a cityId
  email: string;
}

interface ProcessResult {
  exitoso: boolean;
  totalProcesados: number;
  exitosos: number;
  fallidos: number;
  errores: Array<{
    empleado: EmployeeInput;
    error: string;
  }>;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const employees: EmployeeInput[] = await req.json();
    
    if (!Array.isArray(employees) || employees.length === 0) {
      return NextResponse.json({ 
        error: "Se requiere un array de empleados" 
      }, { status: 400 });
    }

    const result: ProcessResult = {
      exitoso: false,
      totalProcesados: employees.length,
      exitosos: 0,
      fallidos: 0,
      errores: []
    };

    for (const employee of employees) {
      try {
        // Validar campos requeridos
        if (!employee.name || !employee.lastName || !employee.email || !employee.identificationNumber || !employee.docType || !employee.cityId) {
          result.errores.push({
            empleado: employee,
            error: "Faltan campos requeridos (name, lastName, identificationNumber, docType, cityId)"
          });
          result.fallidos++;
          continue;
        }

        // Verificar que la ciudad existe
        const cityExists = await db.city.findUnique({
          where: { id: employee.cityId }
        });

        if (!cityExists) {
          result.errores.push({
            empleado: employee,
            error: `La ciudad con ID ${employee.cityId} no existe`
          });
          result.fallidos++;
          continue;
        }

        // Verificar si el colaborador ya existe
        const existingCollaborator = await db.collaborator.findUnique({
          where: { numDoc: employee.identificationNumber, active: true }
        });

        // const existingCollaboratorByEmail = await db.collaborator.findFirst({
        //   where: { email: employee.email, active: true }
        // });

        // if (existingCollaboratorByEmail) {
        //   result.errores.push({
        //     empleado: employee,
        //     error: `Ya existe un colaborador con el correo electrónico: ${employee.email}`
        //   });
        //   result.fallidos++;
        //   continue;
        // }

        if (existingCollaborator) {
          result.errores.push({
            empleado: employee,
            error: `Ya existe un colaborador con número de documento: ${employee.identificationNumber}`
          });
          result.fallidos++;
          continue;
        }

        // Crear el colaborador
        await db.collaborator.create({
          data: {
            name: employee.name.trim(),
            lastname: employee.lastName.trim(),
            docType: employee.docType,
            numDoc: employee.identificationNumber.trim(),
            email: employee.email.trim(),
            cityId: employee.cityId,
          
          },
        });

        result.exitosos++;
      } catch (error) {
        console.error(`Error procesando empleado ${employee.identificationNumber}:`, error);
        result.errores.push({
          empleado: employee,
          error: `Error interno del servidor: ${error instanceof Error ? error.message : 'Error desconocido'}`
        });
        result.fallidos++;
      }
    }

    // Determinar si el proceso fue exitoso
    result.exitoso = result.fallidos === 0;

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error en creación masiva:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 