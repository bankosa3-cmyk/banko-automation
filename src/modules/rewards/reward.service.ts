import { logger } from "../../shared/logger/logger.js";
import { rewardRepository } from "./reward.repository.js";

const FIRST_ORDER_REWARD_AMOUNT = 45;
const FIRST_ORDER_REWARD_MINIMUM_ORDER_AMOUNT = 199;
const FIRST_ORDER_REWARD_VALIDITY_DAYS = 30;

type CreateFirstOrderRewardInput = {
  customerId: string;
  orderId: string;
};

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

export const createFirstOrderRewardIfNeeded = async (
  input: CreateFirstOrderRewardInput,
) => {
  const existingReward = await rewardRepository.findBySourceOrderId(input.orderId);

  if (existingReward) {
    logger.info("First order reward already exists for order", {
      orderId: input.orderId,
      rewardId: existingReward.id,
    });

    return {
      reward: existingReward,
      created: false,
    };
  }

  const reward = await rewardRepository.createFirstOrderReward({
    customerId: input.customerId,
    sourceOrderId: input.orderId,
    amount: FIRST_ORDER_REWARD_AMOUNT,
    minimumOrderAmount: FIRST_ORDER_REWARD_MINIMUM_ORDER_AMOUNT,
    expiresAt: addDays(new Date(), FIRST_ORDER_REWARD_VALIDITY_DAYS),
  });

  logger.info("First order reward created", {
    rewardId: reward.id,
    customerId: input.customerId,
    orderId: input.orderId,
  });

  return {
    reward,
    created: true,
  };
};