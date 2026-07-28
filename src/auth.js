import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";

class EmailNotVerifiedError extends CredentialsSignin {
  code = "email_not_verified";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: "/login",
  },

  providers: [
    Credentials({
      name: "Email dhe password",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";

        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: {
            email,
          },

          include: {
            businesses: {
              where: {
                isActive: true,

                business: {
                  isActive: true,
                },
              },

              include: {
                business: {
                  select: {
                    id: true,
                    name: true,
                    isActive: true,
                  },
                },
              },

              orderBy: {
                createdAt: "asc",
              },
            },
          },
        });

        if (!user || !user.isActive || !user.passwordHash) {
          return null;
        }

        const passwordIsValid = await bcrypt.compare(
          password,
          user.passwordHash,
        );

        if (!passwordIsValid) {
          return null;
        }

        /*
         * Statusi i verifikimit kontrollohet vetëm pasi password-i
         * është konfirmuar si i saktë.
         */
        if (!user.emailVerified) {
          throw new EmailNotVerifiedError();
        }

        const primaryMembership = user.businesses[0] ?? null;

        const isPlatformAdmin = user.globalRole === "PLATFORM_ADMIN";

        const isCustomer = user.globalRole === "CUSTOMER";

        const hasBusinessAccess = user.businesses.length > 0;

        if (!isPlatformAdmin && !isCustomer && !hasBusinessAccess) {
          return null;
        }

        await db.user.update({
          where: {
            id: user.id,
          },

          data: {
            lastLoginAt: new Date(),
          },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,

          globalRole: user.globalRole,
          sessionVersion: user.sessionVersion,

          businessId: primaryMembership?.businessId ?? null,

          businessName: primaryMembership?.business?.name ?? null,

          businessRole: primaryMembership?.role ?? null,

          memberships: user.businesses.map((membership) => ({
            id: membership.id,
            businessId: membership.businessId,
            businessName: membership.business.name,
            role: membership.role,
          })),
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      /*
       * Ekzekutohet gjatë hyrjes së re.
       */
      if (user) {
        token.userId = user.id;
        token.globalRole = user.globalRole ?? null;

        token.sessionVersion = user.sessionVersion ?? 0;

        token.sessionInvalid = false;

        token.businessId = user.businessId ?? null;

        token.businessName = user.businessName ?? null;

        token.businessRole = user.businessRole ?? null;

        token.memberships = user.memberships ?? [];

        return token;
      }

      /*
       * Për çdo sesion ekzistues kontrollojmë nëse përdoruesi
       * është ende aktiv dhe nëse versioni i sesionit përputhet.
       */
      const userId = token.userId ?? token.sub;

      if (!userId) {
        token.sessionInvalid = true;
        return token;
      }

      const currentUser = await db.user.findUnique({
        where: {
          id: userId,
        },

        select: {
          isActive: true,
          sessionVersion: true,
        },
      });

      if (
        !currentUser ||
        !currentUser.isActive ||
        currentUser.sessionVersion !== token.sessionVersion
      ) {
        token.sessionInvalid = true;

        return token;
      }

      token.sessionInvalid = false;

      /*
       * Ndryshimi i biznesit aktiv nga dashboard-i.
       */
      if (trigger === "update" && session?.activeBusinessId) {
        const memberships = Array.isArray(token.memberships)
          ? token.memberships
          : [];

        const selectedMembership = memberships.find(
          (membership) => membership.businessId === session.activeBusinessId,
        );

        if (selectedMembership) {
          token.businessId = selectedMembership.businessId;

          token.businessName = selectedMembership.businessName;

          token.businessRole = selectedMembership.role;
        }
      }

      return token;
    },

    async session({ session, token }) {
      /*
       * Nëse sessionVersion nuk përputhet, përdoruesi nuk
       * konsiderohet më i identifikuar.
       */
      if (token.sessionInvalid) {
        session.user = null;

        return session;
      }

      if (session.user) {
        session.user.id = token.userId ?? token.sub;

        session.user.globalRole = token.globalRole ?? null;

        session.user.businessId = token.businessId ?? null;

        session.user.businessName = token.businessName ?? null;

        session.user.businessRole = token.businessRole ?? null;

        session.user.memberships = token.memberships ?? [];
      }

      return session;
    },

    authorized({ auth: session }) {
      return Boolean(session?.user);
    },
  },
});
