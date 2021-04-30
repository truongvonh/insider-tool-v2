import { App } from "@slack/bolt";
import { env } from "../../constants/enviroment";

const slackChatBot = new App({
  token: env.botUserAuthToken,
  signingSecret: env.slackSignInSecret
});

slackChatBot.message("hello", async ({ message, say }: { message: any; say: any }) => {
  console.log("message", message);
  // say() sends a message to the channel where the event was triggered
  await say(`Hey there <@${message.user}>!`);
});

(async () => {
  await slackChatBot.start(9000);

  console.log("⚡️ Bolt app is running!");
})();

export default slackChatBot;
