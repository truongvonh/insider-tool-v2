import * as moment from "moment";
import { MOMENT_DATE, UTC_OFFSET } from "../../constants/moment.date";
import * as functions from "firebase-functions";
import { AxiosResponse } from "axios";
import { ITimeSheetCalendarResponse } from "../../models/time-sheet-calendar.response";
import axiosInstance from "../../api/axios.config";
import { TIME_SHEET_ADD_ENDPOINT, TIME_SHEET_CALENDAR_ME } from "../../api/endpoint";
import { FULL_DAY_WORKING, HALF_DAY_WORKING } from "../../constants/hour";
import { IRequestCheckin } from "../../models/checkin-request.interface";

export const handlerLogTime = async (context: functions.EventContext) => {
  const today = moment(new Date()).utcOffset(UTC_OFFSET.VIETNAM);
  const todayFormat = today.format(MOMENT_DATE.FORMAT_YYYY_MM_DD);
  functions.logger.info(`========== START CRONJOB AT: ${todayFormat} ==========`);

  try {
    const isWeekendDay = today.day() === MOMENT_DATE.SATURDAY || today.day() === MOMENT_DATE.SUNDAY;

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
};
