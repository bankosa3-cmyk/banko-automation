import { createExpressApp } from "./express.js";
import { logger } from "../shared/logger/logger.js";

const port = Number(process.env.PORT) || 3000;

const app = createExpressApp();

app.listen(port, () => {
  logger.info(`Banko Automation API is running on port ${port}`);
});