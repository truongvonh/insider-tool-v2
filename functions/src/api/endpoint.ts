export const TIME_SHEET_ADD_ENDPOINT = "/timesheet/add";
export const TIME_SHEET_CALENDAR_ME = (
  startDateOfMonth: string = "2021-03-28",
  endDateOfMonth: string = "2021-05-09"
): string => `/timesheet/truong.vo/timesheetCalendar/${startDateOfMonth}/${endDateOfMonth}`;

export const REMOVE_TIME_SHEET_ENDPOINT = (timeSheetId: number): string =>
  `timesheet/${timeSheetId}/remove`;
