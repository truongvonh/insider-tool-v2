import * as functions from "firebase-functions";
import { App, ExpressReceiver } from "@slack/bolt";
import { env } from "../../constants/enviroment";
import "./events.develop";
import { useMessage } from "./useMessage";
import { Env } from "../../models/firebase-config.model";

const expressReceiver = new ExpressReceiver({
  signingSecret: (env as Env).production.slackSignInSecret,
  endpoints: "/events",
  processBeforeResponse: true
});

const app = new App({
  receiver: expressReceiver,
  token: (env as Env).production.botUserAuthToken,
  processBeforeResponse: true
});

// app.error(<ErrorHandler>functions.logger.info);
// Handle `/echo` command invocations
app.command("/echo-from-firebase", async ({ command, ack, say }) => {
  // Acknowledge command request
  await ack();

  // Requires:
  // Add chat:write scope + invite the bot user to the channel you run this command
  // Add chat:write.public + run this command in a public channel
  await say(`You said updated haha`);
});

useMessage(app);

export const slack = functions.https.onRequest(expressReceiver.app);
