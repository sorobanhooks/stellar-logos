import axios from "axios";
import env from "../constants/env";
import { getAuthToken } from "../utils/helperFn";

const baseUrl = `${env.backendUrl}/v1`;

export const handleApi = async ({ url, body, query, token }) => {
  try {
    const authToken = token ? token : getAuthToken();

    const response = await axios({
      url: query ? `${baseUrl + url}${query}` : baseUrl + url,
      ...body,
      headers: {
        Authorization: authToken ? "Bearer " + authToken : undefined,
      },
    });

    const result = await response.data;

    return {
      error: null,
      response: result,
    };
  } catch (error) {
    console.error(error);
    return {
      error,
      response: null,
    };
  }
};
