import moment from "moment";
import { MOMENT_DATE, UTC_OFFSET } from "../../constants/moment.date";
import * as functions from "firebase-functions";
import { AxiosResponse } from "axios";
import { ITimeSheetCalendarResponse } from "../../models/time-sheet-calendar.response";
import axiosInstance from "../../api/axios.config";
import { TIME_SHEET_ADD_ENDPOINT, TIME_SHEET_CALENDAR_ME } from "../../api/endpoint";
import { FULL_DAY_WORKING, HALF_DAY_WORKING } from "../../constants/hour";
import { IRequestCheckin } from "../../models/checkin-request.interface";
import slackWebAPI from "../../services/slack/webAPI";
import { SLACK_DEFAULT_ENV } from "../../constants/enviroment";
import {
  codeBlockFormat,
  inlineCodeFormat,
  prettifySlackMessage,
  tagUserFormat
} from "../../ultils/slack-text.format";
import { SLACK_COMMAND } from "../../constants/slack-command";

const slackMessageToMe = async (message: string): Promise<unknown> => {
  return await slackWebAPI.chat.postMessage({
    channel: SLACK_DEFAULT_ENV.LOG_TIME_CHAT_BOT_CHANNEL,
    text: prettifySlackMessage(message)
  });
};

export const handlerLogTime = async (context: functions.EventContext | unknown): Promise<any> => {
  const today = moment(new Date()).utcOffset(UTC_OFFSET.VIETNAM);
  const todayFormat = today.format(MOMENT_DATE.FORMAT_YYYY_MM_DD);
  functions.logger.info(`========== START CRONJOB AT: ${todayFormat} ==========`);

  try {
    const isWeekendDay = today.day() === MOMENT_DATE.SATURDAY || today.day() === MOMENT_DATE.SUNDAY;

    if (isWeekendDay)
      return await slackMessageToMe(`${todayFormat} is weekend! Log time done! 🤖🤖🤖`);

    const {
      data: logTimeCalendar
    }: AxiosResponse<ITimeSheetCalendarResponse[]> = await axiosInstance.get(
      TIME_SHEET_CALENDAR_ME
    );

    const logTimeByToday = logTimeCalendar.find(
      ({ logDate }: ITimeSheetCalendarResponse) =>
        moment(new Date(logDate)).format(MOMENT_DATE.FORMAT_YYYY_MM_DD) === todayFormat
    );

    const {
      isPublicHoliday,
      isOffMorning,
      isOffAfternoon,
      logTimes
    } = logTimeByToday as ITimeSheetCalendarResponse;

    if (isPublicHoliday || logTimes.length || (isOffMorning && isOffAfternoon))
      return await slackMessageToMe(
        `${todayFormat} is Public holiday or off day! Log time done! 🤖🤖🤖`
      );

    const hoursWorking = isOffMorning || isOffAfternoon ? HALF_DAY_WORKING : FULL_DAY_WORKING;

    const requestPayload: IRequestCheckin = {
      userId: 1,
      logDate: todayFormat,
      hours: hoursWorking,
      hourRate: 1,
      activity: 1,
      projectId: 16548,
      inquiryId: null,
      milestoneId: null
    };

    await axiosInstance.post(TIME_SHEET_ADD_ENDPOINT, requestPayload);

    functions.logger.info(`Check in successful date: ${todayFormat}`);

    const successMessage = `Hey ${tagUserFormat(SLACK_DEFAULT_ENV.USER_ME)}!
                            Check in successful date: ${todayFormat}! 👏👏👏`;

    await slackMessageToMe(successMessage);
  } catch (e) {
    functions.logger.error(e);
    const failedMessage = `Hey ${tagUserFormat(SLACK_DEFAULT_ENV.USER_ME)}!
                           Log time error date: ${todayFormat} 😢😢😢!
                           Log time has error ${codeBlockFormat(e)}
                           If you wanna log time again, type ${inlineCodeFormat(
                             SLACK_COMMAND.LOG_TIME
                           )} 🤖🤖🤖!`;
    await slackMessageToMe(failedMessage);
  } finally {
    functions.logger.info(`========== END CRONJOB AT: ${todayFormat} ==========`);
  }
};
