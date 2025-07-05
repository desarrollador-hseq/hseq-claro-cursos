import { ObjectCannedACL, PutObjectCommand } from "@aws-sdk/client-s3";
import { endpoint, s3Client } from "./s3Client";
import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid"

const bucket = process.env.DO_BUCKET || "hseq"

export async function processAndUploadFile(req: Request) {

    let url: string | null = null;
    try {
        const data = await req.formData();
        const file = data.get("file") as File;
        const field = data.get("field") as string
        const ubiPath = data.get("ubiPath") as string

        // Validate file presence and extension
        if (!file) return { error: "Archivo no subido" };
        if (!field) return { error: "campo no especificado" };
        if (!ubiPath) return { error: "path de archivo no especificado" };
        const fileExt = file?.name.split(".").pop()?.toLowerCase();
        if (!fileExt) return { error: "Nombre de archivo no válido" };

        const validExtensions = ["jpeg", "jpg", "png", "pdf"];
        if (!validExtensions.includes(fileExt))
            return { error: "Tipo de archivo no válido" };

        // Validate file size
        const maxSize = 2 * 1024 * 1024; // 2 MB
        if (file.size > maxSize) {
            console.log("El archivo es demasiado grande")
            throw new Error("El archivo es demasiado grande")
        };

        // Convert file to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)


        const bucketParams = {
            Bucket: bucket,
            Key: `claro/${ubiPath}/${uuid()}.${fileExt}`,
            Body: buffer,
            ACL: ObjectCannedACL.public_read,
            ContentType: file.type
        }

        try {
            await s3Client.send(new PutObjectCommand(bucketParams))
            url = `${endpoint}/${bucket}/${bucketParams.Key}`
        } catch (error) {
            return { error: "Archivo no subido a la nube" }
        }


        return { buffer, file, fileExt, field, url, ubiPath };
    } catch (error) {
        throw new Error(error as string);
    }
}

export async function processAndDeleteFile(ubiPath: string, link?: string) {

    try {
        let url: string | undefined = undefined;

        if (link) {
    
            try {
                url = new URL(link).pathname.substring(1).split("/").pop()
            } catch (error) {
                console.log({ error })
            }
        }
        else {
            return {error: "link no encontrado"}
        }

        const input = {
            Bucket: bucket,
            Key: `claro/${ubiPath}/${url}`,
        };

        console.log({ pathh: `claro/${ubiPath}/${url}` })

        try {
            await s3Client.deleteObject(input);
        } catch (error) {
            console.error("Error al eliminar el objeto:", error);
            return new NextResponse("Error al eliminar el archivo", { status: 400 });
        }

        return { ok: true, };
    } catch (error) {
        return { error };
    }
}


