import { db } from "@/lib/db";

import { AUTH_TOKEN_CONFIG } from "./auth-token-config";
import { AUTH_TOKEN_TYPES } from "./auth-token-types";
import { generateToken, hashToken, addHours } from "./auth-token-utils";

class AuthTokenService {
  async create(userId, type) {
    const config = AUTH_TOKEN_CONFIG[type];

    if (!config) {
      throw new Error(`Unsupported token type: ${type}`);
    }

    await db.authToken.updateMany({
      where: {
        userId,
        type,
        usedAt: null,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    const plainToken = generateToken();

    const tokenHash = hashToken(plainToken);

    await db.authToken.create({
      data: {
        userId,
        type,
        tokenHash,
        expiresAt: addHours(config.expiresInHours),
      },
    });

    return plainToken;
  }

  async verify(token, type) {
    const tokenHash = hashToken(token);

    const authToken = await db.authToken.findFirst({
      where: {
        tokenHash,
        type,
      },
      include: {
        user: true,
      },
    });

    if (!authToken) {
      return {
        valid: false,
        reason: "NOT_FOUND",
      };
    }

    if (!authToken.user.isActive) {
      return {
        valid: false,
        reason: "USER_DISABLED",
      };
    }

    if (authToken.revokedAt) {
      return {
        valid: false,
        reason: "REVOKED",
      };
    }

    if (authToken.usedAt) {
      return {
        valid: false,
        reason: "USED",
      };
    }

    if (authToken.expiresAt < new Date()) {
      return {
        valid: false,
        reason: "EXPIRED",
      };
    }

    return {
      valid: true,
      token: authToken,
    };
  }

  async verifyAndConsume(token, type) {
    const verification = await this.verify(token, type);

    if (!verification.valid) {
      return verification;
    }

    const result = await db.$transaction(async (tx) => {
      await tx.authToken.update({
        where: {
          id: verification.token.id,
        },
        data: {
          usedAt: new Date(),
        },
      });

      return verification.token;
    });

    return {
      valid: true,
      token: result,
    };
  }

  async revokeUserTokens(userId, type) {
    return db.authToken.updateMany({
      where: {
        userId,
        type,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  async cleanupExpired() {
    return db.authToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  async createEmailVerificationToken(userId) {
    return this.create(userId, AUTH_TOKEN_TYPES.EMAIL_VERIFICATION);
  }

  async createPasswordResetToken(userId) {
    return this.create(userId, AUTH_TOKEN_TYPES.PASSWORD_RESET);
  }

  async createAccountActivationToken(userId) {
    return this.create(userId, AUTH_TOKEN_TYPES.ACCOUNT_ACTIVATION);
  }

  async verifyEmailAndConsume(token) {
    const verification = await this.verify(
      token,
      AUTH_TOKEN_TYPES.EMAIL_VERIFICATION,
    );

    if (!verification.valid) {
      return verification;
    }

    const now = new Date();

    const result = await db.$transaction(async (tx) => {
      const tokenUpdate = await tx.authToken.updateMany({
        where: {
          id: verification.token.id,
          usedAt: null,
          revokedAt: null,
          expiresAt: {
            gt: now,
          },
        },
        data: {
          usedAt: now,
        },
      });

      if (tokenUpdate.count !== 1) {
        return {
          valid: false,
          reason: "ALREADY_PROCESSED",
        };
      }

      await tx.user.update({
        where: {
          id: verification.token.userId,
        },
        data: {
          emailVerified: now,
        },
      });

      return {
        valid: true,
        userId: verification.token.userId,
      };
    });

    return result;
  }

  async canResend(userId, type) {
    const config = AUTH_TOKEN_CONFIG[type];

    if (!config) {
      throw new Error(`Unsupported token type: ${type}`);
    }

    const latestToken = await db.authToken.findFirst({
      where: {
        userId,
        type,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        createdAt: true,
      },
    });

    if (!latestToken) {
      return {
        allowed: true,
        retryAfterSeconds: 0,
      };
    }

    const resendAfterMilliseconds = config.resendAfterMinutes * 60 * 1000;

    const nextAllowedAt =
      latestToken.createdAt.getTime() + resendAfterMilliseconds;

    const remainingMilliseconds = nextAllowedAt - Date.now();

    if (remainingMilliseconds <= 0) {
      return {
        allowed: true,
        retryAfterSeconds: 0,
      };
    }

    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(remainingMilliseconds / 1000),
    };
  }

  async canResendEmailVerification(userId) {
    return this.canResend(userId, AUTH_TOKEN_TYPES.EMAIL_VERIFICATION);
  }
  async resetPasswordAndConsume(token, passwordHash) {
    const verification = await this.verify(
      token,
      AUTH_TOKEN_TYPES.PASSWORD_RESET,
    );

    if (!verification.valid) {
      return verification;
    }

    const now = new Date();

    return db.$transaction(async (tx) => {
      const tokenUpdate = await tx.authToken.updateMany({
        where: {
          id: verification.token.id,
          type: AUTH_TOKEN_TYPES.PASSWORD_RESET,
          usedAt: null,
          revokedAt: null,
          expiresAt: {
            gt: now,
          },
        },
        data: {
          usedAt: now,
        },
      });

      if (tokenUpdate.count !== 1) {
        return {
          valid: false,
          reason: "ALREADY_PROCESSED",
        };
      }

      await tx.user.update({
        where: {
          id: verification.token.userId,
        },
        data: {
          passwordHash,
        },
      });

      await tx.authToken.updateMany({
        where: {
          userId: verification.token.userId,
          type: AUTH_TOKEN_TYPES.PASSWORD_RESET,
          id: {
            not: verification.token.id,
          },
          usedAt: null,
          revokedAt: null,
        },
        data: {
          revokedAt: now,
        },
      });

      return {
        valid: true,
        userId: verification.token.userId,
      };
    });
  }
}

export const authTokenService = new AuthTokenService();
