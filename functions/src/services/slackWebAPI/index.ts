import { WebAPICallResult, WebClient } from "@slack/web-api";
import { env, SLACK_DEFAULT_ENV } from "../../constants/enviroment";

const slackWebAPI = new WebClient(env.botUserAuthToken);

(async () => {
  try {
    const res = (await slackWebAPI.chat.postMessage({
      text: `Hey there <@${SLACK_DEFAULT_ENV.USER_ME}>! I'm slack webAPI`,
      channel: SLACK_DEFAULT_ENV.LOG_TIME_CHAT_BOT_CHANNEL
    })) as WebAPICallResult;

    // Properties of the result are now typed
    console.log(
      `A message was posed to conversation ${res.channel} with id ${res.ts} which contains the message ${res.message}`
    );
  } catch (e) {
    console.log("error", e);
  }
})();

export default slackWebAPI;
