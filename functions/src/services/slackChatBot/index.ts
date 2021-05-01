import { App } from "@slack/bolt";
import { env, SLACK_DEFAULT_ENV } from "../../constants/enviroment";
import {
  codeBlockFormat,
  inlineCodeFormat,
  prettifySlackMessage,
  tagUserFormat
} from "../../ultils/slack-text.format";
import { SLACK_COMMAND } from "../../constants/slack-command";
import { ISlackMessage } from "../../models/slack-message.type";
import { handlerLogTime } from "../../cronJobs/logtime/handler";
import slackWebAPI from "../slackWebAPI";
import { SLACK_ENDPOINT } from "../../api/slack.endpoint";
import { ISearchMessageResponse } from "../../models/search-message.response";
import { IListPinMessages, Item } from "../../models/list-pins-message.response";

const slackChatBot = new App({
  token: env.botUserAuthToken,
  signingSecret: env.slackSignInSecret
});

slackChatBot.message(
  SLACK_COMMAND.HELLO,
  async ({ message, say }: { message: unknown | ISlackMessage; say: any | unknown }) => {
    const result = `Hey there 🛩 ${tagUserFormat((message as ISlackMessage).user)}!
                    Check in start here :slack:
                    This is code ${codeBlockFormat(message as ISlackMessage)}`;
    await say(prettifySlackMessage(result));
  }
);

slackChatBot.message(
  SLACK_COMMAND.LOG_TIME,
  async ({ message, say }: { message: unknown | ISlackMessage; say: any | unknown }) => {
    await say(`🤖🤖🤖 Log time start... :loading_airtable:`);
    await handlerLogTime(null);
  }
);

(async () => {
  await slackChatBot.start(9000);

  const searchMessage = `This is Slack ChatBot for log time InsiderTool of the STS Company!`;
  const pingMessage = `${searchMessage}
                       It will be log time on every day at 15PM Vietnam TimeZone.
                       It would notify any times with successful or failed.
                       You could using slack command for for log time without cronjob running by using ${inlineCodeFormat(
                         SLACK_COMMAND.LOG_TIME
                       )} command!`;

  try {
    const searchMessageRes = await slackWebAPI.apiCall(SLACK_ENDPOINT.SEARCH_MESSAGES, {
      query: searchMessage,
      token: env.slackAccessToken
    });

    const {
      messages: { matches: matchSearchMessages }
    } = searchMessageRes as ISearchMessageResponse;

    if (!matchSearchMessages.length) {
      await slackWebAPI.chat.postMessage({
        text: prettifySlackMessage(pingMessage),
        channel: SLACK_DEFAULT_ENV.LOG_TIME_CHAT_BOT_CHANNEL
      });
    }

    const pinMessageResponse = (await slackWebAPI.apiCall(SLACK_ENDPOINT.LIST_PINS, {
      token: env.botUserAuthToken,
      channel: SLACK_DEFAULT_ENV.LOG_TIME_CHAT_BOT_CHANNEL
    })) as IListPinMessages;

    if (pinMessageResponse.items.length) {
      const isMatchPinMessage = pinMessageResponse.items.some(({ message }: Item) =>
        message.text.includes(searchMessage)
      );

      if (!isMatchPinMessage && matchSearchMessages.length) {
        await slackWebAPI.apiCall(SLACK_ENDPOINT.PIN_MESSAGES, {
          token: env.botUserAuthToken,
          channel: matchSearchMessages[0].channel.id,
          timestamp: matchSearchMessages[0].ts
        });
      }
    }

    console.log("⚡️ Bolt app is running!");
  } catch (e) {
    console.log("error", e);
  }
})();

export default slackChatBot;
