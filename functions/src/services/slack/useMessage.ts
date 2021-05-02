import { App } from "@slack/bolt";
import { SLACK_COMMAND } from "../../constants/slack-command";
import { ISlackMessage } from "../../models/slack-message.type";
import {
  codeBlockFormat,
  prettifySlackMessage,
  tagUserFormat
} from "../../ultils/slack-text.format";
import { handlerLogTime } from "../../cronJobs/logtime/handler";

export const useMessage = (app: App) => {
  app.message(
    SLACK_COMMAND.HELLO,
    async ({ message, say }: { message: unknown | ISlackMessage; say: any | unknown }) => {
      const result = `Hey there 🛩 ${tagUserFormat((message as ISlackMessage).user)}!
                      Check in start here :slack:
                      This is code ${codeBlockFormat(message as ISlackMessage)}`;
      await say(prettifySlackMessage(result));
    }
  );

  app.message(
    SLACK_COMMAND.LOG_TIME,
    async ({ message, say }: { message: unknown | ISlackMessage; say: any | unknown }) => {
      await say(`🤖🤖🤖 Log time start... :loading_airtable:`);
      await handlerLogTime(null);
    }
  );
};
