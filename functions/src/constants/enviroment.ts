import * as functions from "firebase-functions";
import { Env, EnvironmentByStage, IFirebaseEnvConfig } from "../models/firebase-config.model";

export const env = (functions.config() as IFirebaseEnvConfig).env;
const stage = (env as Env).stage;
export const envByStage = env[stage] as EnvironmentByStage;

export const SLACK_DEFAULT_ENV = {
  LOG_TIME_CHAT_BOT_CHANNEL: envByStage.chatBotChannel,
  USER_ME: "U020E1HC4DR"
};
