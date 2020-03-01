import { compileProgram, Program } from '../algebra';
import { makeHandlebarsMjmlRenderer } from './renderers';
import { makeSmtpSender, SimpleSMTPConfig } from './senders';

/**
 * Compiles an SMTP mailer for emails with templated MJML/HTML and TXT content.
 *
 * @param smtpConfig SMTP configuration.
 * @param htmTemplate HTML template.
 * @param txtTemplate TXT template, if any.
 */
export function templatedMjmlEmailer(
  smtpConfig: SimpleSMTPConfig,
  htmTemplate: string,
  txtTemplate?: string
): Program<object, string> {
  return compileProgram(makeSmtpSender(smtpConfig), makeHandlebarsMjmlRenderer(htmTemplate, txtTemplate));
}

// Usage:
// ======
//
// import { templatedMjmlEmailer } from './implementations/programs';
// import { RecipientType } from './commons';
//
// export const fullfledged = templatedMjmlEmailer(
//   { host: 'localhost', port: 1025, user: 'u', pass: 'p' },
//   '<mjml><mj-body><mj-text>Hello {{name}}!</mj-text></mj-body></mjml>',
//   'Hello {{name}}!'
// );
//
// fullfledged('This is subject', 'sinan@telostat.com', [{ addr: 'vst@vsthost.com', type: RecipientType.To }], {
//   name: 'world',
// }).then(
//   x => console.log('Success', x),
//   e => console.error('Error', e)
// );
