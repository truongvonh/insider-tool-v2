import axios from "axios";
import * as functions from "firebase-functions";
import { IFirebaseEnvConfig } from "../models/firebase-config.model";

const INSIDER_URL = "https://insiderapi.saigontechnology.vn/api";
export const LEAVE_URL = "https://leaveapi.saigontechnology.vn/api/";

const axiosInstance = axios.create({
  baseURL: INSIDER_URL,
  headers: {
    Authorization: `Bearer ${(functions.config() as IFirebaseEnvConfig).env.requestToken}`
  }
});

export default axiosInstance;
