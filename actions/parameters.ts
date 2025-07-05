"use server";
import { db } from "@/lib/db";



export const getFormationThreshold = async (): Promise<number> => {

    const threshold = await db.formationParameters.findFirst()

    return threshold?.threshold || 80
}