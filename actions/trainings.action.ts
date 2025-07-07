"use server";
import { db } from "@/lib/db";
import { Prisma, TrainingStatus } from "@prisma/client";


export const getTrainings = async ({ status = "all" }: { status: TrainingStatus | "all" }) => {
    const where: Prisma.TrainingWhereInput = {
        active: true
    }

    if (status !== "all") {
        where.status = status;
    }
    try {
        const trainings = await db.training.findMany({
            where,
            include: {
                trainingCollaborators: {
                    include: {
                        collaborator: true,
                        courseLevel: true,
                    }
                },
                course: true,
                coach: true
            },
            orderBy: {
                createdAt: "desc"
            }
        });
        return trainings;
    } catch (error) {
        console.error(error);
        return [];
    }
};
