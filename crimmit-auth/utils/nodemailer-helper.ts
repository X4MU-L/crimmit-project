import nodemailer from "nodemailer";

const gmailAppPassword = "rhue nchr xswn binu";
const gmaiEmaillAddress = "okolisamuel21@gmail.com";
const NoReplyEmail = "noreply@mail";
const smtpHost = "smtp.gmail.com";
const smtpPort = 587;

import { createResetToken, generateMailData, getEjsContent } from "./helper";
import path from "path";
import { ServerError } from "./server-error";

type Data = { [key: string]: any };
type EJSDataType<T> = T extends Data ? T : never;

type MailData = { userName: string; userId: string; email: string };
type OTPDataObjectType<T> = {
  subject: string;
  name: string;
  receivers: string | Array<string>;
  htmlPath: string;
  data: EJSDataType<T>;
};
type VerifyEmailFormatType = {
  from: {
    name: string;
    address: string;
  }; // sender address
  to: string | Array<string>;
  subject: string;
  html: string;
};

declare class NodeMailerClass {
  sendResetLink(mailData: MailData, template: string): Promise<void>;
}

/**
 * NodeMailer class provides functionality to send emails using nodemailer.
 * @class NodeMailer
 * @implements {NodeMailerClass}
 */
class NodeMailer implements NodeMailerClass {
  /**
   * The transporter instance used to send emails.
   * @private
   * @type {Transporter}
   */
  private transporter: nodemailer.Transporter | null;

  /**
   * constructor
   * @param smtpHost the mail host e.g smtp.gmail.com
   * @param smtpPort the port for the transport e.g 25, 467, 578
   * @param gmaiEmaillAddress - the email address for the auth
   * @param gmailAppPassword - the password for the auth, gmail uses app password
   * @constructor
   * @returns {NodeMailer} An instance of NodeMailer.
   */

  constructor(
    smtpHost: string,
    smtpPort: string | number,
    gmaiEmaillAddress: string,
    gmailAppPassword: string
  ) {
    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: +smtpPort,
      secure: +smtpPort === 465 ? true : false, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: gmaiEmaillAddress,
        pass: gmailAppPassword,
      },
    });
  }

  /**
   * generateMailOptions
   * @param subject the subject of the mail
   * @param name the name to use as heading of the mail
   * @param receivers - the recivers, a comma seperated email addresses or an array of email addresses
   * @param text - the text for the body
   * @param html - the html template
   * @param attachments - the array of attachment
   * @returns
   */

  private async generateMailOptions<T>(
    subject: string,
    name: string,
    receivers: string | Array<string>,
    data: EJSDataType<T>,
    htmlPath: string
  ): Promise<VerifyEmailFormatType> {
    const html = await getEjsContent(htmlPath, data);
    if (!html) {
      throw new ServerError(
        "Error occured - contents not read: generateMailOptions",
        500
      );
    }

    return {
      from: {
        name,
        address: NoReplyEmail,
      },
      to: receivers,
      subject,
      html,
    };
  }

  private async sendResetPasswordEmail<T = Data>({
    htmlPath,
    subject,
    data,
    name,
    receivers,
  }: OTPDataObjectType<T>) {
    try {
      const config = await this.generateMailOptions<T>(
        subject,
        name,
        receivers,
        data,
        htmlPath
      );
      const info = await this.sendEmailVerification(config);
      return info;
    } catch (err: unknown) {
      console.log("Error Occured: sendOTPMailForEmail", err);
      throw new ServerError((err as Error).message, 500);
    }
  }

  async sendResetLink(mailData: MailData, template: string) {
    const PORT = process.env.PORT || 5009;
    const link = `http://localhost:${PORT}/api/v1/auth/reset-password/${
      createResetToken(mailData.userId).token
    }`;
    const mailDetails = {
      userName: mailData.userName,
      email: mailData.email,
      link,
    };
    const mainRoot = require.main?.path;
    const mailTemplatePath = path.resolve(
      mainRoot ?? __dirname,
      mainRoot ? "" : "../../",
      `public/${template}.html`
    );
    const data = generateMailData(mailDetails);
    const mailOptions = {
      subject: "Reset your password",
      name: "Reset Your Account Password",
      receivers: [mailData.email],
      htmlPath: mailTemplatePath,
      data,
    };

    await this.sendResetPasswordEmail(mailOptions);
  }
  private async sendEmailVerification(config: VerifyEmailFormatType) {
    // send mail with defined transport object
    try {
      await this.transporter?.verify();
      const info: unknown = await this.transporter?.sendMail(config);
      console.log("Mail sent");
      return info;
    } catch (err: unknown) {
      console.log("Error occured: sendEmailVerificationCode", err);
      throw new ServerError((err as Error).message, 500);
    }
  }
}

export default new NodeMailer(
  smtpHost,
  smtpPort,
  gmaiEmaillAddress,
  gmailAppPassword
);
