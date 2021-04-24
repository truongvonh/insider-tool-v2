export interface IRequestCheckin {
  userId: number;
  logDate: string;
  hours: number;
  hourRate: number;
  activity: number;
  projectId: number;
  inquiryId: null;
  milestoneId: null;
  comment?: string;
}

/*
 * @Title: the example request
 * @Endpoint: https://insiderapi.saigontechnology.vn/api/timesheet/add
{
    "userId":1,
    "logDate":"2021-4-19",
    "hours":8,
    "hourRate":1,
    "activity":1,
    "projectId":16548,
    "inquiryId":null,"milestoneId":null,
    "comment":""
}
*/
