import FormData from "form-data";
import { zidHttpClient } from "./zid.client.js";

type AddCustomerTagInput = {
  customerId: string;
  tagName: string;
};

export const zidCustomerClient = {
  addTagToCustomer: async (input: AddCustomerTagInput) => {
    const formData = new FormData();

    formData.append("names[]", input.tagName);

    const response = await zidHttpClient.put(
      `/v1/managers/store/customers/${input.customerId}/tags`,
      formData,
      {
        headers: formData.getHeaders(),
      },
    );

    return response.data as unknown;
  },
};