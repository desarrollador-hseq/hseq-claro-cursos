import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoginForm } from "./_components/login-form";
import { LogoGrupoHseq } from "@/components/logo-grupo-hseq";
import { TitleApp } from "@/components/title-app";
import { authOptions } from "@/lib/auth-options";


export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session && session.user?.role) {
    redirect("/");
  }


  return (
    <div className="bg-slate-50 h-screen">
      <div className="relative p-1 border-b h-[55px] max-h-[70px] w-full bg-primary shadow-sm flex items-center">
        <div className="mx-auto w-full max-w-[1500px] mt-1">
          <div className="mx-3 flex items-center justify-between">
            <div className="p-2 flex gap-1">
              <LogoGrupoHseq />
            </div>
          </div>
        </div>
      </div>
      <div className="container w-full flex flex-col items-center justify-start pt-14 h-fit">
        <div className="mb-4">
          <TitleApp />
        </div>
        <Card className="p-3 w-[350px] space-y-4 md:space-y-6 rounded-sm">
          <CardHeader>
            <h1 className="text-2xl  font-bold leading-tight tracking-tight text-slate-500 text-center dark:text-white">
              Ingresar
            </h1>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6">
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
