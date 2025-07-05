import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import { Toaster } from "sonner";
import type { Metadata } from "next";

import "./globals.css";
import "simplebar-react/dist/simplebar.min.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "700", "900"],
  variable: "--inter-font",
});

import { cn } from "@/lib/utils";
import { ClientCookiesProvider } from "@/components/providers/cookies-provider";
import { NextAuthProvider } from "@/components/providers/nextauth-provider";

export const metadata: Metadata = {
  title: "Dashboard Claro - altura | GrupoHSEQ",
  description: "Dashboard - avances del proyecto claro - altura",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientCookiesProvider value={cookies().getAll()}>
      <html lang="es">
        <NextAuthProvider>
          <body
            className={cn(
              inter.className,
              "min-h-screen bg-blue-100/50 font-sans antialiased grainy"
            )}
          >
            <Toaster richColors position="top-right" />
            <div className="min-h-screen transition">{children}</div>
            {/* footer */}
            <footer className="footer h-10 w-full bg-primary flex items-center mt-5">
              <div className="w-[70%] mx-auto flex justify-center gap-1 text-white text-sm">
                &copy;
                <span>2025</span>
                <span>
                  <a
                    href="https://grupohseq.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 font-bold"
                  >
                    Grupo HSEQ
                  </a>
                  .
                </span>
                <p className="text-sm">Todos los derechos reservados.</p>
              </div>
            </footer>
          </body>
        </NextAuthProvider>
      </html>
    </ClientCookiesProvider>
  );
}
