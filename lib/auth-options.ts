import { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { db } from "@/lib/db"

export const authOptions: AuthOptions = {

    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "text",
                    placeholder: "pepito@gmail.com@gmail.com"
                },
                password: {
                    lable: "Contraseña",
                    type: "password"
                }
            },
            async authorize(credentials) {
                if (!credentials) {
                    return null
                }

                const { email, password } = credentials

                const user = await db.user.findUnique({
                    where: {
                        email,
                        active: true
                    }
                })

                if (!user) {
                    return null
                }

                const userPassword = user.password
                const isValidPassword = bcrypt.compareSync(password, userPassword!)

                if (!isValidPassword) {
                    return null
                }

                const { password: pass, ...userWithoutPass } = user;

                return userWithoutPass
            }
        })
    ],
    pages: {
        signIn: "/auth/login",
        signOut: "/auth/signout",
        newUser: "/auth/registrarse"
    },
    secret: process.env.NEXTAUTH_SECRET,

    jwt: {
        async encode({ secret, token }) {
            if (!token) {
                throw new Error("NO token to encode")
            }
            return jwt.sign(token, secret)
        },
        async decode({ secret, token }) {
            if (!token) {
                throw new Error("NO token to encode")
            }
            const decodedToken = jwt.verify(token, secret)
            if (typeof decodedToken === "string") {

                return JSON.parse(decodedToken)
            } else {
                return decodedToken
            }
        }

    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
        updateAge: 24 * 60 * 60,

    },
    callbacks: {

        async jwt({ token, account, user }) {
            // console.log({ token, account, user });

            if (account) {
                token.accessToken = account.access_token;

                switch (account.type) {

                    case 'oauth':
                        // token.user = await dbUsers.oAUthToDbUser( user?.email || '', user?.name || '' );
                        break;

                    case 'credentials':
                        token.user = user;
                        break;
                }

            }

            return token;
        },


        async session({ session, token, user }) {
            // console.log({ session, token, user });

            session.user = user;
            session.user = token.user as any;

            return session;
        }


    }


}