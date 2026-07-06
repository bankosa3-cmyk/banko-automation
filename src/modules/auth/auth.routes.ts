import { Router } from "express";
import { env } from "../../config/env.js";
import { logger } from "../../shared/logger/logger.js";
import { zidOAuthService } from "../zid/zid-oauth.service.js";

export const authRoutes = Router();

authRoutes.get("/zid/start", (_req, res) => {
  if (!env.ZID_OAUTH_CLIENT_ID || !env.ZID_OAUTH_REDIRECT_URI) {
    return res.status(500).send("Zid OAuth is not configured.");
  }

  const queries = new URLSearchParams({
    client_id: env.ZID_OAUTH_CLIENT_ID,
    redirect_uri: env.ZID_OAUTH_REDIRECT_URI,
    response_type: "code",
  });

  const authorizationUrl = `https://oauth.zid.sa/oauth/authorize?${queries}`;

  logger.info("Redirecting merchant to Zid OAuth", {
    authorizationUrl,
    clientId: env.ZID_OAUTH_CLIENT_ID,
    redirectUri: env.ZID_OAUTH_REDIRECT_URI,
  });

  return res.redirect(authorizationUrl);
});

authRoutes.get("/zid/callback", async (req, res, next) => {
  try {
    const { code, state, store_id, authorization_code } = req.query;

    logger.info("Zid OAuth callback received", {
      hasCode: typeof code === "string",
      hasAuthorizationCode: typeof authorization_code === "string",
      state: typeof state === "string" ? state : undefined,
      storeId: typeof store_id === "string" ? store_id : undefined,
      query: req.query,
    });

    const grantCode =
      typeof code === "string"
        ? code
        : typeof authorization_code === "string"
          ? authorization_code
          : undefined;

    if (!grantCode) {
      return res.status(400).send("Missing Zid authorization code.");
    }

    const storeId = typeof store_id === "string" ? store_id : undefined;

    const token = await zidOAuthService.exchangeCodeForTokens({
      code: grantCode,
      ...(storeId ? { storeId } : {}),
    });

    return res.status(200).send(`
      <html>
        <body style="font-family: Arial; padding: 40px;">
          <h1>Banko Automation</h1>
          <p>Zid authorization completed successfully.</p>
          <p>Store token saved for store: ${token.storeId}</p>
          <p>You can close this page and return to the setup.</p>
        </body>
      </html>
    `);
  } catch (error) {
    next(error);
  }
});