import { EmailLog } from "../models/emailModel.js";
import { logger } from "../configs/loggerConfig.js";

export async function sendEmail(req, res, next) {
  try {
    const { to, subject, body } = req.body;

    await EmailLog.create({ to, subject, body, status: "sent" });

    logger.info(`📧 Email sent to ${to}`);

    return res.json({ success: true, data: { sentTo: to } });
  } catch (err) {
    await EmailLog.create({ ...req.body, status: "failed", error: err.message });
    logger.error("Email send failed", err);
    return next(err);
  }
}
