import { config } from "firebase-functions";

export interface IFirebaseEnvConfig extends config.Config {
  env: {
    requestToken: string;
  };
}
