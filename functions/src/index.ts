import * as functions from "firebase-functions";
import { Request, Response } from "firebase-functions";
import express from "express";
import { CRON_REGEX } from "./constants/cron.guru";
import axiosInstance from "./api/axios.config";
import { REMOVE_TIME_SHEET_ENDPOINT, TIME_SHEET_CALENDAR_ME } from "./api/endpoint";
import { AxiosResponse } from "axios";
import morgan from "morgan";
import { ITimeSheetCalendarResponse, LogTime } from "./models/time-sheet-calendar.response";
import { IFirebaseEnvConfig } from "./models/firebase-config.model";
import "./services/slack/chatBot";

const app = express();

app.use(morgan("combined"));

app.get("/api", async (req: Request, res: Response) => {
  try {
    const date = new Date();
    const hours = (date.getHours() % 12) + 1; // London is UTC + 1hrs
    res.json({
      bongs: "BONG 123 123".repeat(hours),
      cronTime: CRON_REGEX.AT_15H_DAILY,
      env: (functions.config() as IFirebaseEnvConfig).env
    });
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

export { logTimeCronJob } from "./cronJobs/logtime";
export { slack } from "./services/slack/events";

exports.app = functions
  .region("asia-southeast2")
  .runWith({
    memory: "4GB"
  })
  .https.onRequest(app);
