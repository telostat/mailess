import { createTransport } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { Sender } from '../algebra';
import { Address, Attachments, Recipients, RecipientType } from '../commons';
import { Content } from './generic';

/**
 * Provides an encoding for simple SMTP configuration.
 */
export interface SimpleSMTPConfig {
  host: string;
  port?: number;
  user?: string;
  pass?: string;
}

/**
 * Creates a transport agent which sends emails.
 *
 * @param config SMTP configuration.
 * @returns A [[Mail]] instance as a transport agent to use send mails through.
 */
function makeTransport(config: SimpleSMTPConfig): Mail {
  return createTransport(encodeURI(`smtp://${config.user}:${config.pass}@${config.host}:${config.port}`));
}

/**
 * Creates an SMTP-based [[Sender]] implementation.
 *
 * @param config SMTP configuration.
 * @returns A [[Sender]] implementation.
 */
export function makeSmtpSender(config: SimpleSMTPConfig): Sender<Content, string> {
  return async (
    subject: string,
    from: Address,
    recipients: Recipients,
    content: Content,
    attachments?: Attachments
  ): Promise<string> => {
    // Attempt to send the mail:
    const info = await makeTransport(config).sendMail({
      from: from,
      to: recipients.filter(x => x.type == RecipientType.To).map(x => x.addr),
      cc: recipients.filter(x => x.type == RecipientType.Cc).map(x => x.addr),
      bcc: recipients.filter(x => x.type == RecipientType.Bcc).map(x => x.addr),
      subject: subject,
      text: content.text,
      html: content.html,
      attachments: attachments,
    });

    // Return the message ID:
    return info.messageId;
  };
}
