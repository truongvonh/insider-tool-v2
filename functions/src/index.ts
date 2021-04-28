import * as functions from "firebase-functions";
import { Request, Response } from "firebase-functions";
import * as express from "express";
import * as cron from "node-cron";
import { CRON_REGEX } from "./constants/cron.guru";
import { IRequestCheckin } from "./models/checkin-request.interface";
import axiosInstance from "./api/axios.config";
import { MOMENT_DATE, UTC_OFFSET } from "./constants/moment.date";
import {
  REMOVE_TIME_SHEET_ENDPOINT,
  TIME_SHEET_ADD_ENDPOINT,
  TIME_SHEET_CALENDAR_ME
} from "./api/endpoint";
import { AxiosResponse } from "axios";
import * as morgan from "morgan";
import * as moment from "moment";
import { ITimeSheetCalendarResponse, LogTime } from "./models/time-sheet-calendar.response";
import { FULL_DAY_WORKING, HALF_DAY_WORKING } from "./constants/hour";

const app = express();

app.use(morgan("combined"));

/**
 * @description: Auto checkin tool with cronjob will run at 15h daily Vietnam Timezone
 * @param:  none
 * @return: none
 */
cron.schedule(
  CRON_REGEX.EVERY_HOUR,
  async function () {
    const today = moment(new Date()).utcOffset(UTC_OFFSET.VIETNAM);
    const todayFormat = today.format(MOMENT_DATE.FORMAT_YYYY_MM_DD);
    functions.logger.info(`========== START CRONJOB AT: ${todayFormat} ==========`);

    try {
      const isWeekendDay =
        today.day() === MOMENT_DATE.SATURDAY || today.day() === MOMENT_DATE.SUNDAY;

      if (isWeekendDay) return;

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

      if (isPublicHoliday || logTimes.length || (isOffMorning && isOffAfternoon)) {
        return;
      }

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
    } catch (e) {
      functions.logger.error(e);
    } finally {
      functions.logger.info(`========== END CRONJOB AT: ${todayFormat} ==========`);
    }
  },
  {
    scheduled: true,
    timezone: "Asia/Bangkok"
  }
);

app.get("/api", async (req: Request, res: Response) => {
  try {
    const date = new Date();
    const hours = (date.getHours() % 12) + 1; // London is UTC + 1hr;
    res.json({ bongs: "BONG  ".repeat(hours), cronTime: CRON_REGEX.AT_15H_DAILY });
  } catch (e) {
    functions.logger.error(e);
  }
});

/**
 * API remove all timesheet is not valid
 * @param  none
 * @return none
 */
app.post(
  "/api/remove-timesheet",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const {
        data: logTimeCalendar
      }: AxiosResponse<ITimeSheetCalendarResponse[]> = await axiosInstance.get(
        TIME_SHEET_CALENDAR_ME
      );

      const getInvalidCheckinDay = logTimeCalendar.find(
        ({ isValid }: ITimeSheetCalendarResponse) => !isValid
      );

      if (!getInvalidCheckinDay) return res.status(500).json({ data: "No data remove" });

      const { logTimes } = getInvalidCheckinDay as ITimeSheetCalendarResponse;

      if (!logTimes.length) return res.status(500).json({ data: "No data remove" });

      const onRemoveAllInvalidDatePromise: Promise<AxiosResponse>[] = logTimes.map(
        ({ timesheetId }: LogTime) => axiosInstance.put(REMOVE_TIME_SHEET_ENDPOINT(timesheetId))
      );

      await Promise.all(onRemoveAllInvalidDatePromise);

      return res.json({ data: "Remove all Invalid day success!" });
    } catch (e) {
      res.json({ error: e });
      functions.logger.error(e);
    }
  }
);

app.get("**", (req: Request, res: Response) => {
  res.status(200).send(`
    <!doctype html>
    <head>
      <title>Time</title>
    </head>
    <body>
      <p>Welcome to the firebase Functions</p>
    </body>
  </html>`);
});

exports.app = functions
  .region("asia-southeast2")
  .runWith({
    memory: "4GB"
  })
  .https.onRequest(app);
