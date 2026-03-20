import nodemailer from "nodemailer";

type MailPayload = {
  to: string;
  subject: string;
  text: string;
};

type ReservationMailPayload = {
  to: string;
  dateTime: Date;
  peopleCount: number;
  reason?: string;
};

const mailProvider = (process.env.MAIL_PROVIDER || "smtp").toLowerCase();

const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE || "gmail",
  host: process.env.SMTP_HOST || undefined,
  port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
  secure: process.env.SMTP_SECURE === "true",
  auth:
    process.env.MAIL_USER && process.env.MAIL_PASS
      ? {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        }
      : undefined,
  connectionTimeout: 15_000,
  greetingTimeout: 15_000,
  socketTimeout: 20_000,
});

class MailService {
  private formatReservationDateTime(dateTime: Date): string {
    const date = new Date(dateTime);
    const year = date.getUTCFullYear();
    const month = date.toLocaleString("en-US", {
      month: "short",
      timeZone: "UTC",
    });
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hour = String(date.getUTCHours()).padStart(2, "0");
    const minute = String(date.getUTCMinutes()).padStart(2, "0");

    return `${month} ${day}, ${year}, ${hour}:${minute}`;
  }

  private async sendViaResend(payload: MailPayload): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      throw new Error("RESEND_API_KEY is missing");
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM,
        to: [payload.to],
        subject: payload.subject,
        text: payload.text,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Resend API request failed: ${response.status} ${body}`);
    }
  }

  private async sendViaSmtp(payload: MailPayload): Promise<void> {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
    });
  }

  private async sendMail(payload: MailPayload): Promise<void> {
    if (mailProvider === "resend") {
      await this.sendViaResend(payload);
      return;
    }

    await this.sendViaSmtp(payload);
  }

  public async sendReservationCancelledEmail(payload: ReservationMailPayload) {
    const { to, dateTime, peopleCount, reason } = payload;
    const formattedDateTime = this.formatReservationDateTime(dateTime);

    await this.sendMail({
      to,
      subject: "Your reservation was cancelled",
      text:
        `Sorry, your reservation was cancelled.\n` +
        `Date/Time: ${formattedDateTime}\n` +
        `People: ${peopleCount}\n` +
        (reason ? `Reason: ${reason}\n` : ""),
    });
  }

  public async sendReservationConfirmedEmail(payload: ReservationMailPayload) {
    const { to, dateTime, peopleCount, reason } = payload;
    const formattedDateTime = this.formatReservationDateTime(dateTime);

    await this.sendMail({
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
