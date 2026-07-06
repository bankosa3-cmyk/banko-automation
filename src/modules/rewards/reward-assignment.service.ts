import { env } from "../../config/env.js";
import { logger } from "../../shared/logger/logger.js";
import { zidCustomerClient } from "../zid/zid-customer.client.js";

type AssignFirstOrderRewardInput = {
  zidCustomerId: string;
};

export const assignFirstOrderRewardInZid = async (
  input: AssignFirstOrderRewardInput,
) => {
  await zidCustomerClient.addTagToCustomer({
    customerId: input.zidCustomerId,
    tagName: env.ZID_FIRST_ORDER_REWARD_TAG,
  });

  logger.info("First order reward tag assigned in Zid", {
    zidCustomerId: input.zidCustomerId,
    tagName: env.ZID_FIRST_ORDER_REWARD_TAG,
  });
};
