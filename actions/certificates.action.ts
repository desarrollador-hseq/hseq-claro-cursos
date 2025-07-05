"use server";
import { db } from "@/lib/db";



export const getCertificates = async () => {
    try {

        const certificates = await db.certificate.findMany({
            include: {
                collaborator: {
                    include: {
                        city: true,
                    },
                },
            },
        });
        return certificates;
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const getCertificate = async (certificateId: string) => {
    try {
        const certificate = await db.certificate.findUnique({
            where: { id: certificateId, active: true },
            include: {
                collaborator: {
                    include: {
                        city: true,
                    },
                },
            },
        });
        return certificate;
    } catch (error) {
        console.error(error);
        return null;
    }
};
