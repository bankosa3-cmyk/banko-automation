import { env } from "../config/env.js";
import { logger } from "../shared/logger/logger.js";
import { zidCustomerClient } from "../modules/zid/zid-customer.client.js";

const customerId = process.argv[2];

if (!customerId) {
  throw new Error("Customer ID is required");
}

await zidCustomerClient.addTagToCustomer({
  customerId,
  tagName: env.ZID_FIRST_ORDER_REWARD_TAG,
});

logger.info("Tag added to Zid customer", {
  customerId,
  tagName: env.ZID_FIRST_ORDER_REWARD_TAG,
});