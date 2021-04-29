import * as functions from "firebase-functions";
import { CRON_REGEX } from "../../constants/cron.guru";
import { handlerLogTime } from "./handler";

/**
 * @description: Auto checkin tool with cronjob will run at 15h daily Vietnam Timezone
 * @param:  none
 * @return: none
 */
export const logTimeCronJob = functions
  .runWith({ memory: "1GB" })
  .region("asia-southeast2")
  .pubsub.schedule(CRON_REGEX.AT_15H_DAILY)
  .timeZone("Asia/Bangkok")
  .onRun(handlerLogTime);
