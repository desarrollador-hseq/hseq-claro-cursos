"use client"

interface EppInspectionCertificateProps {
  certificateNumber?: string;
  companyName?: string;
  inspector?: string;
  inspectionDate?: string;
  elementType?: string;
  color?: string;
  manufacturer?: string;
  reference?: string;
  manufacturingDate?: string;
  // Componentes de verificación
  metallicBody?: string;
  connectionRing?: string;
  securityPins?: string;
  structure?: string;
  labels?: string;
  improvementAspect?: string;
  continuesInService?: boolean;
  justification?: string;
  inspectorSignature?: string;
  photos?: string[];
}

export const EppInspectionCertificateTemplate = ({
  certificateNumber = "XXXXX",
  companyName = "CONSTRUCRISMA S.A.S",
  inspector = "",
  inspectionDate = "8 DE MAYO 2025",
  elementType = "ARRESTADOR",
  color = "PLATEADO",
  manufacturer = "YOKE",
  reference = "YN 610 ADP / 16AUY",
  manufacturingDate = "NO DESCRIBE",
  metallicBody = "B",
  connectionRing = "B",
  securityPins = "B",
  structure = "B",
  labels = "B",
  improvementAspect = "LIMPIEZA Y MANTENIMIENTO PREVENTIVO",
  continuesInService = true,
  justification = "Al momento de la Inspección visual el equipo NO presenta daño, cumpliendo las condiciones y características del fabricante.",
  inspectorSignature = "",
  photos = []
}: EppInspectionCertificateProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-6 font-sans text-xs">
      {/* Header */}
      <div className="border-2 border-black">
        {/* Logo and Title Section */}
        <div className="flex items-center justify-between p-4 border-b border-black">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-orange-500 rounded mr-4 flex items-center justify-center">
              <span className="text-white font-bold text-lg">HSEQ</span>
            </div>
          </div>
          <div className="text-center flex-1">
            <h1 className="text-lg font-bold text-red-600">HSEQ – CGIR S.A.S.</h1>
            <h2 className="text-sm font-bold text-red-600">CONSULTORIA EN GESTION INTEGRAL DE RIESGOS</h2>
          </div>
        </div>

        {/* Certificate Info Section */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="mb-2">
                <span className="font-bold">CERTIFICADO</span>
                <div className="ml-8">FOR-HSEQ-CGIR-155</div>
              </div>
              <div className="mb-2">
                <span className="font-bold">Denominación:</span>
                <div className="font-bold">Inspección de equipos y elementos para trabajo seguro en alturas</div>
              </div>
            </div>
            <div className="text-right">
              <div className="mb-1">Emisión: 08/11/2021</div>
              <div className="mb-1">Versión: 01</div>
              <div className="mb-1">Revisión:</div>
              <div className="border border-black p-2 mt-2">
                <div className="font-bold">CERTIFICADO No</div>
                <div className="text-center font-bold text-lg">{certificateNumber}</div>
              </div>
            </div>
          </div>

          {/* Company and Inspector Info */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="flex items-center mb-2">
                <span className="font-bold mr-2">EMPRESA USUARIA:</span>
                <div className="border border-black px-2 py-1 flex-1 text-center font-bold">
                  {companyName}
                </div>
              </div>
              <div className="flex items-center">
                <span className="font-bold mr-2">INSPECTOR ENCARGADO:</span>
                <div className="border border-black px-2 py-1 flex-1">
                  {inspector}
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center">
                <span className="font-bold mr-2">FECHA DE INSPECCIÓN:</span>
                <div className="border border-black px-2 py-1 flex-1 text-center font-bold">
                  {inspectionDate}
                </div>
              </div>
              {/* Photos Section */}
              <div className="mt-4">
                <div className="font-bold text-center mb-2">Registros Fotográficos</div>
                <div className="grid grid-cols-2 gap-2">
                  {photos.length > 0 ? (
                    photos.slice(0, 2).map((photo, index) => (
                      <div key={index} className="border border-gray-300 h-20 bg-gray-100">
                        <img src={photo} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="border border-gray-300 h-20 bg-gray-100"></div>
                      <div className="border border-gray-300 h-20 bg-gray-100"></div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Element Description */}
          <div className="mb-4">
            <h3 className="font-bold mb-2">1. DESCRIPCIÓN DEL ELEMENTO/EQUIPO</h3>
            <table className="w-full border border-black">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-black p-2 text-xs">TIPO DE ELEMENTO</th>
                  <th className="border border-black p-2 text-xs">COLOR</th>
                  <th className="border border-black p-2 text-xs">FABRICANTE</th>
                  <th className="border border-black p-2 text-xs">REFERENCIA/SERIAL</th>
                  <th className="border border-black p-2 text-xs">FECHA MANUFACTURA</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-2 text-center font-bold">{elementType}</td>
                  <td className="border border-black p-2 text-center">{color}</td>
                  <td className="border border-black p-2 text-center font-bold">{manufacturer}</td>
                  <td className="border border-black p-2 text-center">{reference}</td>
                  <td className="border border-black p-2 text-center">{manufacturingDate}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Component Verification */}
          <div className="mb-4">
            <h3 className="font-bold mb-2">2. VERIFICACIÓN DE LOS COMPONENTES DEL ELEMENTO/EQUIPO (B: Bueno, M: Malo, NA: No aplica)</h3>
            <table className="w-full border border-black">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-black p-2 text-xs">Cuerpo metálico</th>
                  <th className="border border-black p-2 text-xs">Argolla de conexión</th>
                  <th className="border border-black p-2 text-xs">Seguros, tornillo, platina de seguridad</th>
                  <th className="border border-black p-2 text-xs">Estructura, Platinas, resortes</th>
                  <th className="border border-black p-2 text-xs">Etiquetas</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-2 text-center font-bold">{metallicBody}</td>
                  <td className="border border-black p-2 text-center font-bold">{connectionRing}</td>
                  <td className="border border-black p-2 text-center font-bold">{securityPins}</td>
                  <td className="border border-black p-2 text-center font-bold">{structure}</td>
                  <td className="border border-black p-2 text-center font-bold">{labels}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Improvement Aspect */}
          <div className="mb-4">
            <h3 className="font-bold mb-2">3. ASPECTO POR MEJORAR</h3>
            <div className="border border-black p-2 min-h-[40px]">
              {improvementAspect}
            </div>
          </div>

          {/* Determination */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold mb-2">4. DETERMINACIÓN</h3>
                <div className="flex items-center">
                  <span className="font-bold mr-4">CONTINUA EN SERVICIO:</span>
                  <div className="border border-black px-4 py-1">
                    <span className="font-bold">{continuesInService ? "SI" : "NO"}</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="font-bold mb-2">FIRMA DEL INSPECTOR CERTIFICADO:</div>
                <div className="border-b border-black w-48 h-12 flex items-end justify-center">
                  {inspectorSignature && (
                    <span className="text-xs">{inspectorSignature}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Justification */}
          <div className="mb-4">
            <div className="border border-black p-2">
              <div className="font-bold mb-1">JUSTIFICACIÓN:</div>
              <div>{justification}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};