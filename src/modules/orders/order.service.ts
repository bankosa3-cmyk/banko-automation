import { customerRepository } from "../customers/customer.repository.js";
import { orderRepository } from "./order.repository.js";
import type { ParsedZidOrder } from "./order-webhook.parser.js";

export const handleCompletedOrder = async (parsedOrder: ParsedZidOrder) => {
  const customer = await customerRepository.upsertByZidCustomerId({
    zidCustomerId: parsedOrder.customer.zidCustomerId,
    ...(parsedOrder.customer.name ? { name: parsedOrder.customer.name } : {}),
    ...(parsedOrder.customer.email ? { email: parsedOrder.customer.email } : {}),
    ...(parsedOrder.customer.phone ? { phone: parsedOrder.customer.phone } : {}),
  });

  const order = await orderRepository.upsertCompletedOrder({
    zidOrderId: parsedOrder.zidOrderId,
    customerId: customer.id,
    status: parsedOrder.status,
    totalAmount: parsedOrder.totalAmount,
    completedAt: parsedOrder.completedAt,
  });

  const completedOrdersCount =
    await orderRepository.countCompletedOrdersByCustomerId(customer.id);

  return {
    customer,
    order,
    isFirstCompletedOrder: completedOrdersCount === 1,
    completedOrdersCount,
  };
};