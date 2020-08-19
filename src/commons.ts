import { NonEmptyArray } from './prelude';

/**
 * Defines an encoding for email addresses.
 *
 * This should be RFC-compliant as per (see [Addr-spec](https://tools.ietf.org/html/rfc5322#page-1)).
 */
export type Address = string;

/**
 * Defines an enumeration for recipient types.
 */
export enum RecipientType {
  To = 1,
  Cc,
  Bcc,
}

/**
 * Provides an encoding for email addresses.
 */
export interface Recipient {
  /** Recipient address */
  addr: string;

  /** Recipient type. */
  type: RecipientType;
}

/**
 * Provides a convenience type alias for an array of recipients.
 */
export type Recipients = NonEmptyArray<Recipient>;

/**
 * Provides an encoding for common mail-meta information.
 */
export interface MailMeta {
  /** Email subject line. */
  subject: string;

  /** Sender address. */
  from: Address;

  /** Non-empty array of recipient addresses. */
  recipients: NonEmptyArray<Recipient>;
}

/**
 * Provides a simple encoding for attachments with path-to-file and file name.
 */
export interface Attachment {
  /** Desired file name of the attachment. */
  filename: string;

  /** Path to the attachment file. */
  path: string;
}

/**
 * Provides a convenience type alias for an array of attachments.
 */
export type Attachments = Array<Attachment>;
