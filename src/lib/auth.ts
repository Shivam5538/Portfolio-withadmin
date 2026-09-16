import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const cleanEmail = credentials.email.trim();
          const user = await prisma.adminUser.findFirst({
            where: {
              email: {
                equals: cleanEmail,
                mode: "insensitive",
              },
            },
          });

          if (!user) {
            console.warn(`[NextAuth] Admin login: no user found matching ${cleanEmail}`);
            return null;
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!isValid) {
            console.warn(`[NextAuth] Admin login: invalid password for ${cleanEmail}`);
            return null;
          }

          return {
            id: user.id,
            email: user.email,
          };
        } catch (err) {
          console.error("[NextAuth] Error during authorize:", err);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/admin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "dev-secret-key-changed-to-force-logout-123",
};

