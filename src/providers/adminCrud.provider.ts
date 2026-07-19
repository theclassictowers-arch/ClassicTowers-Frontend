import type { DataProvider } from "@refinedev/core";
import { axiosInstance } from "../utils";

const message = (error: any) =>
  error?.response?.data?.message || error?.message || "Request failed";

const unwrapOne = (payload: any) => payload?.data ?? payload;

export const adminCrudProvider: DataProvider = {
  getList: async ({ resource }) => {
    try {
      const response = await axiosInstance.get(`/${resource}`);
      const payload = response.data;
      const records = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];
      return {
        data: records,
        total: Number(payload?.total ?? payload?.count) || records.length,
      };
    } catch (error) {
      throw new Error(message(error));
    }
  },
  getOne: async ({ resource, id }) => {
    try {
      const response = await axiosInstance.get(`/${resource}/${id}`);
      return { data: unwrapOne(response.data) };
    } catch (error) {
      throw new Error(message(error));
    }
  },
  create: async ({ resource, variables }) => {
    try {
      const response = await axiosInstance.post(`/${resource}`, variables);
      return { data: unwrapOne(response.data) };
    } catch (error) {
      throw new Error(message(error));
    }
  },
  update: async ({ resource, id, variables }) => {
    try {
      const response = await axiosInstance.patch(`/${resource}/${id}`, variables);
      return { data: unwrapOne(response.data) };
    } catch (error) {
      throw new Error(message(error));
    }
  },
  deleteOne: async ({ resource, id }) => {
    try {
      const response = await axiosInstance.delete(`/${resource}/${id}`);
      return { data: unwrapOne(response.data) };
    } catch (error) {
      throw new Error(message(error));
    }
  },
  getApiUrl: () => axiosInstance.defaults.baseURL || "",
};
