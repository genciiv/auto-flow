import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { consumeRateLimit, getClientIpFromHeaders, RATE_LIMIT_POLICIES } from "@/lib/rate-limit";
import { isAccountLocked, recordFailedLogin, resetFailedLogins } from "@/lib/login-protection";

const DUMMY_PASSWORD_HASH =
  "$2b$12$KIXxP0D5RjQ1oZpjZx1x4eJ5aYj6fgl2w2l4vM2B2kL0Qz9oYjZrW";

class EmailNotVerifiedError extends CredentialsSignin {
  code = "email_not_verified";
}

class PersonalAccessRequiredError extends CredentialsSignin {
  code = "personal_access_required";
}

class BusinessAccessRequiredError extends CredentialsSignin {
  code = "business_access_required";
}

function mapMemberships(memberships = []) {
  return memberships.map((membership) => ({
    id: membership.id,
    businessId: membership.businessId,
    businessName: membership.business.name,
    role: membership.role,
  }));
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),

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

        portalType: {
          label: "Portali",
          type: "text",
        },
      },

      async authorize(credentials, request) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";

        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        const portalType =
          credentials?.portalType === "business" ? "business" : "personal";

        if (!email || !password) {
          return null;
        }

        const ip = getClientIpFromHeaders(request.headers);
        const [ipLimit, identifierLimit] = await Promise.all([
          consumeRateLimit({ scope: "loginIp", identifiers: [ip], policy: RATE_LIMIT_POLICIES.loginIp }),
          consumeRateLimit({ scope: "loginIdentifier", identifiers: [ip, email], policy: RATE_LIMIT_POLICIES.loginIdentifier }),
        ]);

        if (!ipLimit.allowed || !identifierLimit.allowed) {
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

        /*
         * Kryejmë gjithmonë bcrypt.compare për të zvogëluar diferencën
         * e kohës mes një email-i ekzistues dhe një email-i të panjohur.
         */
        const passwordHash =
          user?.isActive && user?.passwordHash
            ? user.passwordHash
            : DUMMY_PASSWORD_HASH;

        const passwordIsValid = await bcrypt.compare(password, passwordHash);

        if (!user || !user.isActive || !user.passwordHash) {
          return null;
        }

        if (isAccountLocked(user)) {
          return null;
        }

        if (!passwordIsValid) {
          await recordFailedLogin(user.id);
          return null;
        }

        /*
         * Email-i kontrollohet vetëm pasi password-i
         * është verifikuar si i saktë.
         */
        if (!user.emailVerified) {
          throw new EmailNotVerifiedError();
        }

        const isPlatformAdmin = user.globalRole === "PLATFORM_ADMIN";
        const isCustomer = user.globalRole === "CUSTOMER";
        const hasBusinessAccess = user.businesses.length > 0;

        if (portalType === "personal" && !isCustomer) {
          throw new PersonalAccessRequiredError();
        }

        if (
          portalType === "business" &&
          !isPlatformAdmin &&
          !hasBusinessAccess
        ) {
          throw new BusinessAccessRequiredError();
        }

        await resetFailedLogins(user.id);

        await db.user.update({
          where: {
            id: user.id,
          },

          data: {
            lastLoginAt: new Date(),
          },
        });

        const memberships = mapMemberships(user.businesses);

        const primaryMembership = memberships[0] ?? null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,

          globalRole: user.globalRole,

          sessionVersion: user.sessionVersion,

          businessId: primaryMembership?.businessId ?? null,

          businessName: primaryMembership?.businessName ?? null,

          businessRole: primaryMembership?.role ?? null,

          memberships,
          loginPortal: portalType,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") {
        return true;
      }

      const email =
        typeof user?.email === "string" ? user.email.trim().toLowerCase() : "";

      if (!email || profile?.email_verified !== true) {
        return false;
      }

      let databaseUser = await db.user.findUnique({
        where: { email },
        include: {
          businesses: {
            where: {
              isActive: true,
              business: { isActive: true },
            },
            include: {
              business: {
                select: { id: true, name: true, isActive: true },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (databaseUser && (!databaseUser.isActive || databaseUser.globalRole !== "CUSTOMER")) {
        return false;
      }

      if (!databaseUser) {
        const fallbackName =
          typeof user?.name === "string" && user.name.trim()
            ? user.name.trim()
            : email.split("@")[0];

        try {
          databaseUser = await db.user.create({
            data: {
              name: fallbackName,
              email,
              passwordHash: null,
              globalRole: "CUSTOMER",
              isActive: true,
              emailVerified: new Date(),
              lastLoginAt: new Date(),
              customerProfile: { create: {} },
            },
            include: {
              businesses: {
                include: {
                  business: {
                    select: { id: true, name: true, isActive: true },
                  },
                },
              },
            },
          });
        } catch (error) {
          if (error?.code !== "P2002") {
            throw error;
          }

          databaseUser = await db.user.findUnique({
            where: { email },
            include: {
              businesses: {
                where: {
                  isActive: true,
                  business: { isActive: true },
                },
                include: {
                  business: {
                    select: { id: true, name: true, isActive: true },
                  },
                },
                orderBy: { createdAt: "asc" },
              },
            },
          });

          if (!databaseUser || !databaseUser.isActive || databaseUser.globalRole !== "CUSTOMER") {
            return false;
          }
        }
      } else {
        databaseUser = await db.user.update({
          where: { id: databaseUser.id },
          data: {
            emailVerified: databaseUser.emailVerified ?? new Date(),
            lastLoginAt: new Date(),
            customerProfile: {
              upsert: {
                create: {},
                update: {},
              },
            },
          },
          include: {
            businesses: {
              where: {
                isActive: true,
                business: { isActive: true },
              },
              include: {
                business: {
                  select: { id: true, name: true, isActive: true },
                },
              },
              orderBy: { createdAt: "asc" },
            },
          },
        });
      }

      await resetFailedLogins(databaseUser.id);

      const memberships = mapMemberships(databaseUser.businesses);
      const primaryMembership = memberships[0] ?? null;

      user.id = databaseUser.id;
      user.name = databaseUser.name;
      user.email = databaseUser.email;
      user.globalRole = databaseUser.globalRole;
      user.sessionVersion = databaseUser.sessionVersion;
      user.businessId = primaryMembership?.businessId ?? null;
      user.businessName = primaryMembership?.businessName ?? null;
      user.businessRole = primaryMembership?.role ?? null;
      user.memberships = memberships;
      user.loginPortal = "personal";

      return true;
    },

    async jwt({ token, user, trigger, session }) {
      /*
       * Ekzekutohet menjëherë pas login-it.
       */
      if (user) {
        token.userId = user.id;

        token.globalRole = user.globalRole ?? null;

        token.sessionVersion = user.sessionVersion ?? 0;

        token.sessionInvalid = false;

        token.businessId = user.businessId ?? null;

        token.businessName = user.businessName ?? null;

        token.businessRole = user.businessRole ?? null;

        token.memberships = Array.isArray(user.memberships)
          ? user.memberships
          : [];

        token.loginPortal = user.loginPortal ?? "personal";

        return token;
      }

      const userId = token.userId ?? token.sub;

      if (!userId) {
        token.sessionInvalid = true;

        return token;
      }

      /*
       * Në çdo kontroll të sesionit rilexojmë:
       * - statusin e përdoruesit
       * - sessionVersion
       * - globalRole
       * - bizneset aktive
       *
       * Kjo bën që një biznes i aprovuar nga admini
       * të shfaqet edhe te sesioni i përdoruesit.
       */
      const currentUser = await db.user.findUnique({
        where: {
          id: userId,
        },

        select: {
          isActive: true,
          sessionVersion: true,
          globalRole: true,

          businesses: {
            where: {
              isActive: true,

              business: {
                isActive: true,
              },
            },

            orderBy: {
              createdAt: "asc",
            },

            select: {
              id: true,
              businessId: true,
              role: true,

              business: {
                select: {
                  id: true,
                  name: true,
                  isActive: true,
                },
              },
            },
          },
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

      token.globalRole = currentUser.globalRole ?? null;

      const memberships = mapMemberships(currentUser.businesses);

      token.memberships = memberships;

      /*
       * Ruajmë biznesin aktual nëse përdoruesi
       * vazhdon të ketë akses në të.
       */
      const currentMembership = memberships.find(
        (membership) => membership.businessId === token.businessId,
      );

      const primaryMembership = currentMembership ?? memberships[0] ?? null;

      token.businessId = primaryMembership?.businessId ?? null;

      token.businessName = primaryMembership?.businessName ?? null;

      token.businessRole = primaryMembership?.role ?? null;

      /*
       * Përdoret kur përdoruesi zgjedh një biznes
       * tjetër nga workspace switcher.
       */
      if (trigger === "update" && session?.activeBusinessId) {
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

        session.user.memberships = Array.isArray(token.memberships)
          ? token.memberships
          : [];

        session.user.loginPortal = token.loginPortal ?? null;
      }

      return session;
    },

    authorized({ auth: session }) {
      return Boolean(session?.user);
    },
  },
});
