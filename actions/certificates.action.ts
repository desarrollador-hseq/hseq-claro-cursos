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

// Nueva función para obtener certificados con información de cursos
export const getCertificatesWithCourses = async () => {
    try {
        // Obtener certificados regulares
        const certificates = await db.certificate.findMany({
            where: {
                active: true,
            },
            include: {
                courseLevel: {
                    include: {
                        course: true,
                    },
                },
            },
        });

        // Obtener certificados CETAR
        const cetarCertificates = await db.cetarCertificate.findMany({
            where: {
                active: true,
            },
            include: {
                courseLevel: {
                    include: {
                        course: true,
                    },
                },
            },
        });

        return {
            certificates,
            cetarCertificates,
        };
    } catch (error) {
        console.error(error);
        return {
            certificates: [],
            cetarCertificates: [],
        };
    }
};


export const getEppCertificationInspection = async (eppInspectionId: string) => {
    try {
        const eppInspection = await db.eppCertificationInspection.findUnique({
            where: { id: eppInspectionId, status: "VALIDATED" },
        });
        return eppInspection;
    } catch (error) {
        console.error(error);
        return null;
    }
};