import { createExpressApp } from "./express.js";
import { env } from "../config/env.js";
import { logger } from "../shared/logger/logger.js";

const app = createExpressApp();

app.listen(env.PORT, () => {
  logger.info(`Banko Automation API is running on port ${env.PORT}`);
});
