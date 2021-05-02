import { config } from "firebase-functions";

enum StageEnum {
  develop,
  production
}

export interface Env {
  stage: StageEnum;
  test: string;
  requestToken: string;
  develop: EnvironmentByStage;
  production: EnvironmentByStage;
}

export interface EnvironmentByStage {
  slackAccessToken: string;
  botUserAuthToken: string;
  slackSignInSecret: string;
  chatBotChannel: string;
}

export interface IFirebaseEnvConfig extends config.Config {
  env: Env | any;
}
