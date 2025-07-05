"use server"
import { db } from "@/lib/db";



export const getCourses = async () => {
    try {
        const courses = await db.course.findMany({
            where: {
                active: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return courses;
    } catch (error) {
        console.log(error);
        return [];
    }
};

export const getCourseById = async (courseId: string, withLevels: boolean = false) => {
    try {
        const course = await db.course.findUnique({
            where: {
                id: courseId,
                active: true,
            },
            include: {
                courseLevels: withLevels ? {
                    include: {
                        course: true,
                        requiredDocuments: {
                            orderBy: {
                                createdAt: "asc",
                            },
                            where: {
                                active: true
                            }
                        },
                    },
                } : false,
            },
        });
        return course;
    } catch (error) {
        console.log(error);
        return null;
    }
}