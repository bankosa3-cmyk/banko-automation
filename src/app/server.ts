import { createExpressApp } from "./express.js";

const port = Number(process.env.PORT) || 3000;

const app = createExpressApp();

app.listen(port, () => {
  console.log(`Banko Automation API is running on port ${port}`);
});