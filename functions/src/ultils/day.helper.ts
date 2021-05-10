import { MOMENT_DATE } from "../constants/moment.date";
import moment = require("moment");

export const enumerateDaysBetweenDates = (startDate: string, endDate: string): string[] => {
  let date = [];
  while (moment(startDate) <= moment(endDate)) {
    date.push(startDate);
    startDate = moment(startDate).add(1, "days").format(MOMENT_DATE.FORMAT_YYYY_MM_DD);
  }
  return date;
};

export const getStartAndEndDateOfMonth = () => {
  const startOfMonth = moment().clone().startOf("month").format(MOMENT_DATE.FORMAT_YYYY_MM_DD);
  const endOfMonth = moment().clone().endOf("month").format(MOMENT_DATE.FORMAT_YYYY_MM_DD);

  return {
    startOfMonth,
    endOfMonth
  };
};
