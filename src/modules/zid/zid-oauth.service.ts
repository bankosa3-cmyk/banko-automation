import axios from "axios";
import { env } from "../../config/env.js";
import { AppError } from "../../shared/errors/AppError.js";
import { logger } from "../../shared/logger/logger.js";
import { prisma } from "../../shared/database/prisma.js";

type ZidTokenResponse = {
  access_token?: string;
  Authorization?: string;
  authorization?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
};

const getRequiredOAuthConfig = () => {
  if (
    !env.ZID_OAUTH_CLIENT_ID ||
    !env.ZID_OAUTH_CLIENT_SECRET ||
    !env.ZID_OAUTH_REDIRECT_URI
  ) {
    throw new AppError("Zid OAuth credentials are not configured", 500);
  }

  return {
    clientId: env.ZID_OAUTH_CLIENT_ID,
    clientSecret: env.ZID_OAUTH_CLIENT_SECRET,
    redirectUri: env.ZID_OAUTH_REDIRECT_URI,
  };
};

const calculateExpiresAt = (expiresIn?: number) => {
  if (!expiresIn) {
    return null;
  }

  return new Date(Date.now() + expiresIn * 1000);
};

export const zidOAuthService = {
  async exchangeCodeForTokens(input: { code: string; storeId?: string }) {
    const { clientId, clientSecret, redirectUri } = getRequiredOAuthConfig();

    const response = await axios.post<ZidTokenResponse>(
      "https://oauth.zid.sa/oauth/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code: input.code,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        timeout: 15000,
      },
    );

    const managerToken = response.data.access_token;
    const authorizationToken =
      response.data.Authorization ?? response.data.authorization;

    if (!managerToken || !authorizationToken) {
      logger.error("Zid OAuth token response is missing required tokens", {
        hasAccessToken: Boolean(managerToken),
        hasAuthorization: Boolean(authorizationToken),
        responseKeys: Object.keys(response.data),
      });

      throw new AppError("Zid OAuth token response is invalid", 502);
    }

    const storeId = input.storeId ?? env.ZID_STORE_ID;

    if (!storeId) {
      throw new AppError("Zid store id is not configured", 500);
    }

    const token = await prisma.zidStoreToken.upsert({
      where: {
        storeId,
      },
      create: {
        storeId,
        authorizationToken,
        managerToken,
        refreshToken: response.data.refresh_token ?? null,
        tokenType: response.data.token_type ?? null,
        expiresAt: calculateExpiresAt(response.data.expires_in),
      },
      update: {
        authorizationToken,
        managerToken,
        refreshToken: response.data.refresh_token ?? null,
        tokenType: response.data.token_type ?? null,
        expiresAt: calculateExpiresAt(response.data.expires_in),
      },
    });

    logger.info("Zid OAuth tokens saved", {
      storeId: token.storeId,
      hasRefreshToken: Boolean(token.refreshToken),
      expiresAt: token.expiresAt,
    });

    return token;
  },
};