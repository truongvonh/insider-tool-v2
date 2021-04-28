import * as functions from "firebase-functions";
import { CRON_REGEX } from "../../constants/cron.guru";
import { handlerLogTime } from "./handler";

/**
 * @description: Auto checkin tool with cronjob will run at 15h daily Vietnam Timezone
 * @param:  none
 * @return: none
 */
export const logTimeCronJob = functions
  .region("asia-southeast2")
  .runWith({ memory: "1GB" })
  .pubsub.schedule(CRON_REGEX.EVERY_MINUTE)
  .timeZone("Asia/Bangkok")
  .onRun(handlerLogTime);
