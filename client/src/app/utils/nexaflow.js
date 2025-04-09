import NexaflowInit from "nexaflow-web-sdk";
import { envObj, nexaflowObj } from "./constants";

const nexaflowApi = new NexaflowInit(envObj.nexaflowApiKey);

const getGoogleSheetData = async () => {
  try {
    const googlesheetData = await nexaflowApi.getGoogleSheetData({
      googleSheetId: nexaflowObj.googleSheetId,
    });
    return googlesheetData;
  } catch (error) {
    console.log(error);

    return null;
  }
};

const postGoogleSheetData = async (data) => {
  try {
    const response = await nexaflowApi.postGoogleSheetData({
      googleSheetId: nexaflowObj.googleSheetId,
      data,
    });
    // console.log(response);
    return response;
  } catch (error) {
    console.log(error);

    return null;
  }
};

export { getGoogleSheetData, postGoogleSheetData };
