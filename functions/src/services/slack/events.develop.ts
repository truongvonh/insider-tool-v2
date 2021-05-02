import { App } from "@slack/bolt";
import { env } from "../../constants/enviroment";
import { useMessage } from "./useMessage";
import { Env } from "../../models/firebase-config.model";

const slackChatBot = new App({
  token: (env as Env).develop.botUserAuthToken,
  signingSecret: (env as Env).develop.slackSignInSecret
});

useMessage(slackChatBot);

(async () => {
  await slackChatBot.start(9000);
  console.log("⚡️ Bolt app is running!");
})();

export default slackChatBot;
