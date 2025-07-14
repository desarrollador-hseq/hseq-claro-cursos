"use server";
import { db } from "@/lib/db";
import { City } from "@prisma/client";



export const getFormationThreshold = async (): Promise<number> => {

    const threshold = await db.formationParameters.findFirst()

    return threshold?.threshold || 80
}

export const getCities = async (): Promise<City[]> => {
    try {
        const cities = await db.city.findMany({
            where: {
                active: true,
            },
            orderBy: {
                realName: "asc",
            },
        })
        return cities
    } catch (error) {
        console.log(error)
        return []
    }
    
}
