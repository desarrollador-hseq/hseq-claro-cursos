import NextAuth from "next-auth"
import { Role } from "@prisma/client";
import { DefaultSession } from "next-auth";
import { authOptions } from "@/lib/auth-options"


declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    fullname: string;
    role: Role;
    createdAt: Date;
    updatedAt: Date;

  }

  interface Session {
    user: {
      role?: string;
      id?: string;
    } & DefaultSession['user'];
  }
}


const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }