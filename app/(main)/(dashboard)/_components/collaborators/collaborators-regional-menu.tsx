"use client";



import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { City, Collaborator, Regional } from "@prisma/client";
import { SimpleModal } from "@/components/simple-modal";
import { Chart } from "@/components/chart";

interface RegionalWithCollaborator extends Regional {
  cities: (City & { collaborators: Collaborator[] | null | undefined} | null | undefined)[];
}

interface CollaboratorsRegionalMenuProps {
  regionals: RegionalWithCollaborator[] | null | undefined;
}

export function CollaboratorsRegionalMenu({
  regionals,
}: CollaboratorsRegionalMenuProps) {
  return (
    <NavigationMenu className="z-20 p-1">
      <NavigationMenuList className="">
        {regionals?.map((reg) => (
          <NavigationMenuItem key={reg.id}>
            <NavigationMenuTrigger className="uppercase">
              {reg.name}
            </NavigationMenuTrigger>
            <NavigationMenuContent className="">
              <ul className="grid gap-3 p-6 md:w-[400px] grid-cols-2 lg:w-[500px] ">
                {reg?.cities?.map((city) => (
                  <li key={city?.id} className="">
                    <NavigationMenuLink asChild>
                      <SimpleModal
                        title={`Datos de la ciudad de: ${city?.realName}`}
                        textBtn={city?.realName}
                        btnClass="flex h-full w-full select-none flex-col justify-end rounded-md bg-primary p-6 no-underline outline-none focus:shadow-md"
                      >
                        <div className="grid grid-cols-1 gap-2">
                          <ContentRegionalModal
                            title="Estados por Formación presencial"
                            city={reg.cities.find((ct) => ct?.id === city?.id)}
                            virtual={false}
                          />
                        </div>
                      </SimpleModal>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

interface CityWithCollaborators extends City {
  collaborators: Collaborator[] | undefined | null;
}

interface ContentRegionalModalProps {
  city?: CityWithCollaborators | undefined | null;
  title: string;
  virtual: boolean;
}

const ContentRegionalModal = ({
  city,
  title,
  virtual,
}: ContentRegionalModalProps) => {
  const countCollaborators = (collaborators: Collaborator[]) => {
    let formadoCount = 0;
    let formacionCount = 0;

    // console.log({collaborators: collaborators})

    collaborators.forEach(({ percentage }) => {
      // traer threshold de la db
      if (percentage === 80) {
        formadoCount += 1;
      } else {
        formacionCount += 1;
      }
    });
    return [formadoCount, formacionCount];
  };

  const [formadoCount, formacionCount] = countCollaborators(city?.collaborators ? city?.collaborators : []);

  const option = {
    tooltip: {},
    series: [
      {
        type: "pie",
        radius: "50%",
        center: ["50%", "50%"],
        label: {
          show: true,
          formatter: "{b}: {c} ({d}%)",
        },
        data: [
          {
            value: formadoCount === 0 ? [] : formadoCount,
            name: "Formado",
            itemStyle: { color: "#4e71b1" },
          },
          {
            value: formacionCount === 0 ? [] : formadoCount,
            name: "Formación",
            itemStyle: { color: "#bae0fc" },
          },
        ],
      },
    ],
    title: {
      show: city?.collaborators?.length === 0,
      textStyle: {
        color: "grey",
        fontSize: 20,
      },
      text: "Sin datos",
      left: "center",
      top: "center",
    },
  };

  return <Chart option={option} title={title} />;
};
