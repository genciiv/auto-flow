import { db } from "@/lib/db";

import { AUTH_TOKEN_CONFIG } from "./auth-token-config";
import { AUTH_TOKEN_TYPES } from "./auth-token-types";
import { addHours, generateToken, hashToken } from "./auth-token-utils";

class AuthTokenService {
  async create(userId, type, metadata = null) {
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
        metadata,
      },
    });

    return plainToken;
  }

  async verify(token, type) {
    if (!token) {
      return {
        valid: false,
        reason: "NOT_FOUND",
      };
    }

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

    const now = new Date();

    const result = await db.$transaction(async (tx) => {
      const tokenUpdate = await tx.authToken.updateMany({
        where: {
          id: verification.token.id,
          type,
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
        return null;
      }

      return verification.token;
    });

    if (!result) {
      return {
        valid: false,
        reason: "ALREADY_PROCESSED",
      };
    }

    return {
      valid: true,
      token: result,
    };
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

    return db.$transaction(async (tx) => {
      const tokenUpdate = await tx.authToken.updateMany({
        where: {
          id: verification.token.id,
          type: AUTH_TOKEN_TYPES.EMAIL_VERIFICATION,
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

      const updatedUser = await tx.user.update({
        where: {
          id: verification.token.userId,
        },
        data: {
          passwordHash,
          sessionVersion: {
            increment: 1,
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          sessionVersion: true,
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
        user: updatedUser,
      };
    });
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

  async canResendPasswordReset(userId) {
    return this.canResend(userId, AUTH_TOKEN_TYPES.PASSWORD_RESET);
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

  async createEmailChangeToken(userId, newEmail, oldEmail) {
    return this.create(userId, AUTH_TOKEN_TYPES.EMAIL_CHANGE, {
      newEmail,
      oldEmail,
    });
  }

  async canResendEmailChange(userId) {
    return this.canResend(userId, AUTH_TOKEN_TYPES.EMAIL_CHANGE);
  }

  async changeEmailAndConsume(token) {
    const verification = await this.verify(
      token,
      AUTH_TOKEN_TYPES.EMAIL_CHANGE,
    );

    if (!verification.valid) {
      return verification;
    }

    const metadata = verification.token.metadata;

    const newEmail =
      metadata &&
      typeof metadata === "object" &&
      !Array.isArray(metadata) &&
      typeof metadata.newEmail === "string"
        ? metadata.newEmail.trim().toLowerCase()
        : "";

    const oldEmail =
      metadata &&
      typeof metadata === "object" &&
      !Array.isArray(metadata) &&
      typeof metadata.oldEmail === "string"
        ? metadata.oldEmail.trim().toLowerCase()
        : verification.token.user.email;

    if (!newEmail) {
      return {
        valid: false,
        reason: "INVALID_METADATA",
      };
    }

    const now = new Date();

    try {
      return await db.$transaction(async (tx) => {
        const tokenUpdate = await tx.authToken.updateMany({
          where: {
            id: verification.token.id,
            type: AUTH_TOKEN_TYPES.EMAIL_CHANGE,
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

        const existingUser = await tx.user.findUnique({
          where: {
            email: newEmail,
          },
          select: {
            id: true,
          },
        });

        if (existingUser && existingUser.id !== verification.token.userId) {
          return {
            valid: false,
            reason: "EMAIL_TAKEN",
          };
        }

        const updatedUser = await tx.user.update({
          where: {
            id: verification.token.userId,
          },
          data: {
            email: newEmail,
            emailVerified: now,
            sessionVersion: {
              increment: 1,
            },
          },
          select: {
            id: true,
            name: true,
            email: true,
            sessionVersion: true,
          },
        });

        await tx.authToken.updateMany({
          where: {
            userId: verification.token.userId,
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
          user: updatedUser,
          oldEmail,
          newEmail,
        };
      });
    } catch (error) {
      if (error?.code === "P2002") {
        return {
          valid: false,
          reason: "EMAIL_TAKEN",
        };
      }

      throw error;
    }
  }

  async activateAccountAndConsume(token, passwordHash) {
    const verification = await this.verify(
      token,
      AUTH_TOKEN_TYPES.ACCOUNT_ACTIVATION,
    );

    if (!verification.valid) {
      return verification;
    }

    const now = new Date();

    return db.$transaction(async (tx) => {
      const tokenUpdate = await tx.authToken.updateMany({
        where: {
          id: verification.token.id,
          type: AUTH_TOKEN_TYPES.ACCOUNT_ACTIVATION,
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

      const updatedUser = await tx.user.update({
        where: {
          id: verification.token.userId,
        },
        data: {
          passwordHash,
          emailVerified: now,
          isActive: true,
          sessionVersion: {
            increment: 1,
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      await tx.authToken.updateMany({
        where: {
          userId: verification.token.userId,
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
        user: updatedUser,
      };
    });
  }
}

export const authTokenService = new AuthTokenService();
