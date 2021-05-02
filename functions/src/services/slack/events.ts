import * as functions from "firebase-functions";
import { App, ExpressReceiver } from "@slack/bolt";
import { env } from "../../constants/enviroment";
import { ErrorHandler } from "@slack/bolt/dist/App";

const expressReceiver = new ExpressReceiver({
  signingSecret: env.slackSignInSecret,
  endpoints: "/events",
  processBeforeResponse: true
});

const app = new App({
  receiver: expressReceiver,
  token: env.botUserAuthToken,
  processBeforeResponse: true
});

app.error(<ErrorHandler>functions.logger.info);

export const slack = functions.https.onRequest(expressReceiver.app);
