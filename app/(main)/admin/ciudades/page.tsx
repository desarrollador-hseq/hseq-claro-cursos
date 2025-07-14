import Link from "next/link";
import { Map, PlusCircle } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { CitiesDataTable } from "./_components/cities-datatable";
import { citiesColumns } from "./_components/cities-datatable-columns";
import { RegionalDataTable } from "./_components/regional-datatable";
import { regionalColumns } from "./_components/regional-datatable-columns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AdminOnly } from "@/components/rbac-wrapper";
import TitlePage from "@/components/title-page";

const InspectionsPage = async () => {
  const cities = await db.city.findMany({
    where: {
      active: true,
    },
    include: {
      regional: true,
    },
    orderBy: {
      realName: "asc",
    },
  });

  const regional = await db.regional.findMany({
    where: {
      active: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="max-w-[1500px] mx-auto p-1">
      <div className="grid lg:grid-cols-3 gap-3">
        <div className="col-span-1 lg:col-span-2 rounded-sm">
          <TitlePage
            icon={<Map className="w-8 h-8" />}
            title="Listado de ciudades"
            description=""
          >
            <AdminOnly>
              <Link href="/admin/ciudades/crear">
                <Button>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Registrar ciudad
                </Button>
              </Link>
            </AdminOnly>
          </TitlePage>

          <div className="p-4">
            <CitiesDataTable columns={citiesColumns} data={cities} />
          </div>
        </div>

        {/* Regionales */}
        <Card className="col-span-2 lg:col-span-1 rounded-sm">
          <CardHeader className="flex flex-row justify-between gap-y-1">
            <div className="flex flex-col">
              <h1 className="text-2xl font-semibold">Listado de regionales</h1>
              <span className="text-sm text-slate-500 font-light">
                Listado completo de regionales registradas.
              </span>
            </div>

            <AdminOnly>
              <Link href="/admin/regionales/crear">
                <Button>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Registrar regional
                </Button>
              </Link>
            </AdminOnly>
          </CardHeader>
          <CardContent>
            <RegionalDataTable columns={regionalColumns} data={regional} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InspectionsPage;
