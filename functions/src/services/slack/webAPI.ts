// @ts-ignore
import { WebAPICallResult, WebClient } from "@slack/web-api";
import { envByStage, SLACK_DEFAULT_ENV } from "../../constants/enviroment";
import { inlineCodeFormat, prettifySlackMessage } from "../../ultils/slack-text.format";
import { SLACK_COMMAND } from "../../constants/slack-command";
import { SLACK_ENDPOINT } from "../../api/slack.endpoint";
import { ISearchMessageResponse } from "../../models/search-message.response";
import { IListPinMessages, Item } from "../../models/list-pins-message.response";

const slackWebAPI = new WebClient(envByStage.botUserAuthToken);

(async () => {
  try {
    const searchMessage = `This is Slack ChatBot for log time InsiderTool of the STS Company!`;
    const pingMessage = `${searchMessage}
                         It will be log time on every day at 15PM Vietnam TimeZone.
                         It would notify any times with successful or failed.
                         You could using slack command for for log time without cronjob running by using ${inlineCodeFormat(
                           SLACK_COMMAND.LOG_TIME
                         )} command!`;

    const searchMessageRes = await slackWebAPI.apiCall(SLACK_ENDPOINT.SEARCH_MESSAGES, {
      query: searchMessage,
      token: envByStage.slackAccessToken
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
      token: envByStage.botUserAuthToken,
      channel: SLACK_DEFAULT_ENV.LOG_TIME_CHAT_BOT_CHANNEL
    })) as IListPinMessages;

    if (pinMessageResponse.items.length) {
      const isMatchPinMessage = pinMessageResponse.items.some(({ message }: Item) =>
        message.text.includes(searchMessage)
      );

      if (!isMatchPinMessage && matchSearchMessages.length) {
        await slackWebAPI.apiCall(SLACK_ENDPOINT.PIN_MESSAGES, {
          token: envByStage.botUserAuthToken,
          channel: matchSearchMessages[0].channel.id,
          timestamp: matchSearchMessages[0].ts
        });
      }
    }
    console.log("slack webAPI running");
  } catch (e) {
    console.log("error", e);
  }
})();

export default slackWebAPI;
