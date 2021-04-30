import * as functions from "firebase-functions";
import { IFirebaseEnvConfig } from "../models/firebase-config.model";

export const env = (functions.config() as IFirebaseEnvConfig).env;

export const SLACK_DEFAULT_ENV = {
  LOG_TIME_CHAT_BOT_CHANNEL: "D02072ZJTAA",
  USER_ME: "U020E1HC4DR"
};
