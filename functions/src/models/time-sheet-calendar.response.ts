export interface ITimeSheetCalendarResponse {
  logDate: Date;
  isPublicHoliday: boolean;
  isOffMorning: boolean;
  isOffAfternoon: boolean;
  invalidMessage: null | string;
  isValid: boolean;
  logTimes: LogTime[];
  isNormalWorkingDay: boolean;
}

export interface LogTime {
  timesheetId: number;
  projectId: number;
  projectName: ProjectName;
  pcName: PCName;
  hours: number;
  hourRate: number;
  logDate: Date;
  comment: null | string;
  activity: number;
  total: number;
  userId: number;
  approveStatus: null;
  editable: boolean;
  deletable: boolean;
  inquiryId: null;
  inquiryName: null;
  milestoneId: null;
}

export enum PCName {
  LiemNguyen = "Liem Nguyen"
}

export enum ProjectName {
  PerXTechODC = "PerXTech ODC"
}
