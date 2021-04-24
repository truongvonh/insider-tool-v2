import * as functions from "firebase-functions";
import { config, Request, Response } from "firebase-functions";
import * as express from "express";
import * as cron from "node-cron";
import { CRON_REGEX } from "./constants/cron.guru";
import { IRequestCheckin } from "./models/checkin-request.interface";
import axiosInstance, { LEAVE_URL } from "./api/axios.config";
import { MOMENT_DATE } from "./constants/moment.date";
// @ts-ignore
import { LEAVE_REQUEST_ENDPOINT, TIME_SHEET_ADD_ENDPOINT } from "./api/endpoint";
import { AxiosResponse } from "axios";
import { ILeaveRequestPayload } from "./models/leave.interface";
import { enumerateDaysBetweenDates } from "./ultils/day.helper";
import * as morgan from "morgan";
import moment = require("moment");
import Config = config.Config;

const app = express();

app.use(morgan("combined"));

cron.schedule(
  CRON_REGEX.EVERY_MINUTE,
  async function () {
    const today = moment(new Date());
    const todayFormat = today.format(MOMENT_DATE.FORMAT_YYYY_MM_DD);
    try {
      functions.logger.info(`========== START CRONJOB AT: ${todayFormat} ==========`);
      const isWeekendDay =
        today.day() === MOMENT_DATE.SATURDAY || today.day() === MOMENT_DATE.SUNDAY;

      if (isWeekendDay) return;

      const {
        data: {
          result: { result: resultData }
        }
      }: AxiosResponse<ILeaveRequestPayload> = await axiosInstance.get(LEAVE_REQUEST_ENDPOINT, {
        baseURL: LEAVE_URL,
        params: { take: 20 }
      });
      functions.logger.info(`========== resultData: ${resultData} ==========`);

      for (const leaveItem of resultData) {
        const monthOfLeaveEndDate = moment(new Date(leaveItem.endDate)).month();
        const monthOfLeaveStartDate = moment(new Date(leaveItem.startDate)).month();
        const thisMonth = today.month();

        if (thisMonth > monthOfLeaveEndDate || thisMonth < monthOfLeaveStartDate) break;

        const { endDate, startDate } = leaveItem;

        if (endDate === startDate) {
          const endDateFormat = moment(new Date(endDate)).format(MOMENT_DATE.FORMAT_YYYY_MM_DD);

          if (todayFormat === endDateFormat) {
            return;
          }
        }

        const endDateFormat = moment(new Date(endDate)).format(MOMENT_DATE.FORMAT_YYYY_MM_DD);
        const startDateFormat = moment(new Date(startDate)).format(MOMENT_DATE.FORMAT_YYYY_MM_DD);

        const todayInRangeLeaveDays = enumerateDaysBetweenDates(
          endDateFormat,
          startDateFormat
        ).includes(todayFormat);

        if (todayInRangeLeaveDays) return;
      }

      console.log("start check in here");

      // @ts-ignore
      const requestPayload: IRequestCheckin = {
        userId: 1,
        logDate: todayFormat,
        hours: 8,
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
    timezone: "Asia/Bangkok"
  }
);

// cron.schedule(CHECKIN_CRON_REGEX_TIME, () => {});

app.get("/api", async (req: Request, res: Response) => {
  const date = new Date();
  const hours = (date.getHours() % 12) + 1; // London is UTC + 1hr;
  console.log("functions.config", functions.config() as Config);
  res.json({ bongs: "BONG ".repeat(hours), token: functions.config() });
});

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

exports.app = functions.https.onRequest(app);
