

const { PrismaClient } = require("@prisma/client")
const database = new PrismaClient()

async function main() {
    try {
        await database.user.createMany({
            data: [
                { username: "administrator", password: "$2a$10$lA5JIqCs5R8Eae2FgYMQTeEc1VXx2MTsQC9ql0xNIxnBlXXexN4GS", role: "ADMIN" },
                { username: "viewer", password: "$2a$10$obvjJMBoXAme55FJVAqrTuTJySFurGrrgXefvf7rYPtfpSbe5YJsa", role: "VIEWER" },
            ]
        })

        console.log("Success")
    } catch (error) {
        console.log("Error seeding the database categories", error)
    } finally {
        await database.$disconnect()
    }
}

async function mainwd() {
    try {
        await database.formationParameters.create({
            data: {
                threshold: 80
            }
        })

        console.log("Success")
    } catch (error) {
        console.log("Error seeding the database categories", error)
    } finally {
        await database.$disconnect()
    }
}

async function mainw() {
    try {
        await database.city.createMany({
            data: [
                { realName: "Bogotá", formated: "bogota" },
                { realName: "Villavicencio", formated: "villavicencio" },
                { realName: "Tunja", formated: "tunja" },
                { realName: "Yopal", formated: "yopal" },
                { realName: "Neiva", formated: "neiva" },
                { realName: "Barranquilla", formated: "barranquilla" },
                { realName: "Santa Marta", formated: "santa-marta" },
                { realName: "Cartagena", formated: "cartagena" },
                { realName: "Montería", formated: "monteria" },
                { realName: "Sincelejo", formated: "sincelejo" },
                { realName: "Valledupar", formated: "valledupar" },
                { realName: "Medellín", formated: "medellin" },
                { realName: "Pereira", formated: "pereira" },
                { realName: "Ibagué", formated: "ibague" },
                { realName: "Manizales", formated: "manizales" },
                { realName: "Cali", formated: "cali" },
                { realName: "Pasto", formated: "pasto" },
                { realName: "Bucaramanga", formated: "bucaramanga" },
                { realName: "Cúcuta", formated: "cucuta" },

            ]
        })

        console.log("Success")
    } catch (error) {
        console.log("Error seeding the database categories", error)
    } finally {
        await database.$disconnect()
    }
}


// main()

// mainwd()

mainw()