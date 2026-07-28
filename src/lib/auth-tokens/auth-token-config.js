import { AUTH_TOKEN_TYPES } from "./auth-token-types";

export const AUTH_TOKEN_CONFIG = {
  [AUTH_TOKEN_TYPES.EMAIL_VERIFICATION]: {
    expiresInHours: 24,
    resendAfterMinutes: 5,
  },

  [AUTH_TOKEN_TYPES.PASSWORD_RESET]: {
    expiresInHours: 1,
    resendAfterMinutes: 2,
  },

  [AUTH_TOKEN_TYPES.ACCOUNT_ACTIVATION]: {
    expiresInHours: 48,
    resendAfterMinutes: 5,
  },

  [AUTH_TOKEN_TYPES.EMAIL_CHANGE]: {
    expiresInHours: 1,
    resendAfterMinutes: 5,
  },
};
