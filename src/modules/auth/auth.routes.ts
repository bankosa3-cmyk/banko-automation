import { Router } from "express";
import { logger } from "../../shared/logger/logger.js";

export const authRoutes = Router();

authRoutes.get("/zid/callback", (req, res) => {
  const { code, state, store_id, authorization_code } = req.query;

  logger.info("Zid OAuth callback received", {
    code: typeof code === "string" ? code : undefined,
    authorizationCode:
      typeof authorization_code === "string" ? authorization_code : undefined,
    state: typeof state === "string" ? state : undefined,
    storeId: typeof store_id === "string" ? store_id : undefined,
    query: req.query,
  });

  return res.status(200).send(`
    <html>
      <body style="font-family: Arial; padding: 40px;">
        <h1>Banko Automation</h1>
        <p>Zid authorization callback received successfully.</p>
        <p>You can close this page and return to the setup.</p>
      </body>
    </html>
  `);
});