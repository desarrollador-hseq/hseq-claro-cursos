import { redirect } from "next/navigation";

export default function InspeccionesPage() {
  // Redirigir automáticamente a la página de equipos
  redirect("/admin/inspecciones/equipos");
}