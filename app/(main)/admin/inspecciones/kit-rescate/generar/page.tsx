import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EppInspectionValidationExcel } from '../_components/epp-inpection-validation-excel';
import { getCities } from '@/actions/parameters';
import Link from 'next/link';

export default async function GenerarInspeccionesEppPage() {
  const cities = await getCities();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/inspecciones/equipos">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Cargar Inspecciones EPP desde Excel
            </h1>
            <p className="text-gray-600">
              Procesa inspecciones de equipos de protección personal desde archivos de Microsoft Forms
            </p>
          </div>
        </div>
      </div>

      {/* Componente de carga Excel */}
      <EppInspectionValidationExcel cities={cities || []} />
    </div>
  );
}
