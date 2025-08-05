"use client";
import {
  TabNavigation,
  TabNavigationLink,
} from "@/components/ui/tab-navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationSettings = [
  {
    name: "Equipos (EPCC)",
    href: `/admin/inspecciones/equipos`,
    pattern: /^\/admin\/inspecciones\/equipos.*/, // Coincide con /proveedores y sus subrutas, pero no con /documentacion
  },
  {
    name: "Instalaciones (UVAE)",
    href: `/admin/inspecciones/instalaciones`,
    pattern: /^\/admin\/inspecciones\/instalaciones.*/, // Coincide con /documentacion y sus subrutas
  },
  {
    name: "Kit de rescate",
    href: `/admin/inspecciones/kit-rescate`,
    pattern: /^\/admin\/inspecciones\/kit-rescate.*/, // Coincide con /documentacion y sus subrutas
  },
];

const InspectionsLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  const isActiveTab = (pattern: RegExp) => {
    return pattern.test(pathname);
  };

  console.log({ pathname });

  return (
    <div className="flex flex-col  justify-center gap-0">
      <div className="flex justify-center">
        <TabNavigation className="">
          {navigationSettings.map((item) => (
            <TabNavigationLink
              className="min-w-[160px]"
              key={item.name}
              asChild
              active={isActiveTab(item.pattern)}
            >
              <Link href={item.href}>{item.name}</Link>
            </TabNavigationLink>
          ))}
        </TabNavigation>
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
};

export default InspectionsLayout;
