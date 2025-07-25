
import { PrismaClient } from "@prisma/client"

declare global {
    var prisma: PrismaClient | undefined
}

export const db = globalThis.prisma || new PrismaClient({
  log: ['query', 'error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

if(process.env.NODE_ENV !== "production") globalThis.prisma = db

