import { db } from "@/lib/db";


export const getCetars = async () => {
    try {
        const cetars = await db.cetar.findMany({
            where: {
                active: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return cetars;
    } catch (error) {
        console.log(error);
        return [];
    }
};

export const getCetarById = async (id: string) => {
    try {
        const cetar = await db.cetar.findUnique({
            where: { id, active: true },
        });
        return cetar;
    } catch (error) {
        console.log(error);
        return null;
    }
};