import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",               // ✅ keep
  auth: {
    user: process.env.MAIL_USER!, // ✅ keep
    pass: process.env.MAIL_PASS!, // ✅ keep (app password)
  },
});

class MailService {
  public async sendReservationCancelledEmail(payload: {
    to: string;
    dateTime: Date;
    peopleCount: number;
    reason?: string;
  }) {
    const { to, dateTime, peopleCount, reason } = payload;
    
    // Format date/time in UTC to show the original reservation time
    const date = new Date(dateTime);
    const year = date.getUTCFullYear();
    const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hour = String(date.getUTCHours()).padStart(2, '0');
    const minute = String(date.getUTCMinutes()).padStart(2, '0');
    const formattedDateTime = `${month} ${day}, ${year}, ${hour}:${minute}`;

    await transporter.sendMail({
      from: process.env.MAIL_FROM, // unchanged
      to,
      subject: "Your reservation was cancelled",
      text:
        `Sorry, your reservation was cancelled.\n` +
        `Date/Time: ${formattedDateTime}\n` +
        `People: ${peopleCount}\n` +
        (reason ? `Reason: ${reason}\n` : ""),
    });
  }
  public async sendReservationConfirmedEmail(payload: {
    to: string;
    dateTime: Date;
    peopleCount: number;
    reason?: string;
  }) {
    const { to, dateTime, peopleCount, reason } = payload;
    
    // Format date/time in UTC to show the original reservation time
    const date = new Date(dateTime);
    const year = date.getUTCFullYear();
    const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hour = String(date.getUTCHours()).padStart(2, '0');
    const minute = String(date.getUTCMinutes()).padStart(2, '0');
    const formattedDateTime = `${month} ${day}, ${year}, ${hour}:${minute}`;

    await transporter.sendMail({
      from: process.env.MAIL_FROM, // unchanged
      to,
      subject: "Your reservation was confirmed",
      text:
        `Your reservation was confirmed.\n` +
        `Date/Time: ${formattedDateTime}\n` +
        `People: ${peopleCount}\n` +
        (reason ? `Reason: ${reason}\n` : ""),
    });
  }
}

export default new MailService();
