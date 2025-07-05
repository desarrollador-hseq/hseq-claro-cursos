import { Suspense } from "react";

import "simplebar-react/dist/simplebar.min.css";

import { DashboardProvider } from "@/components/providers/dashboard-provider";
import { Loading } from "@/components/loading";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <div className="min-h-screen transition">
        <Suspense fallback={<Loading />}>{children}</Suspense>
      </div>
    </DashboardProvider>
  );
}
