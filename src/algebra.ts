import { Address, Attachments, Recipients } from './commons';

/**
 * Defines Mailess program contract.
 *
 * Essentially, the program consumes (1) email subject, (2) sender address, (3) one or more recipients,
 * (4) content payload and (5) attachments (if any), renders the payload to some content, attempts to
 * send the email and returns a [[Result]].
 */
export type Program<P, R> = (
  subject: string,
  from: Address,
  recipients: Recipients,
  payload: P,
  attachments?: Attachments
) => Promise<R>;

/**
 * Defines Mailess sender contract.
 *
 * The sender consumes (1) email subject, (2) sender address, (3) one or more recipients, (4) content,
 * and (5) attachments (if any), attempts to send the email and returns a [[Result]].
 */
export type Sender<C, R> = (
  subject: string,
  from: Address,
  recipients: Recipients,
  content: C,
  attachments?: Attachments
) => Promise<R>;

/**
 * Defines Mailess content payload rendering contract.
 */
export type Renderer<P, C> = (payload: P) => Promise<C>;

/**
 * Compiles the Mailess program for given [[Sender]] and [[Renderer]] implementations.
 *
 * @param sender [[Sender]] implementation.
 * @param renderer [[Renderer]] implementation.
 */
export function compileProgram<P, C, R>(sender: Sender<C, R>, renderer: Renderer<P, C>): Program<P, R> {
  return async (
    subject: string,
    from: Address,
    recipients: Recipients,
    payload: P,
    attachments?: Attachments
  ): Promise<R> => {
    // Attempt to get the content:
    const content = await renderer(payload);

    // Now, attempt to send:
    const result = await sender(subject, from, recipients, content, attachments);

    // Done, return:
    return result;
  };
}
