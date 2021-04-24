export interface ILeaveRequestPayload {
  result: IResultPayload;
  targetUrl: null;
  success: boolean;
  error: null;
  unAuthorizedRequest: boolean;
  __ncf: boolean;
}

export interface IResultPayload {
  total: number;
  result: IResultElement[];
  skip: number;
  take: number;
  terms: string;
}

export interface IResultElement {
  id: number;
  employee: string;
  empCode: string;
  startDate: Date;
  endDate: Date;
  startHour: number;
  endHour: number;
  totalDays: number;
  leaveType: string;
  leaveTypeId: number;
  reason: string;
  isSubmittedToPayroll: boolean;
  status: number;
  isCanApproveReject: boolean;
  isCanCancel: boolean;
  isCanDelete: boolean;
  lineManagerApproval: string;
  lineManagerEmpcode: string;
}
