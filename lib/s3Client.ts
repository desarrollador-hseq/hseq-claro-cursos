import { S3 } from "@aws-sdk/client-s3"

export const endpoint = "https://sfo2.digitaloceanspaces.com"

export const s3Client = new S3({
    endpoint,
    region: 'us-east-2',
    credentials: {
        accessKeyId: process.env.DO_ACCESS_KEY!,
        secretAccessKey: process.env.DO_SECRET_KEY!,
    }
})
