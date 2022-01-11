import { Request, Response } from 'express';
import { Address, Attachments, Recipient, RecipientType } from '../../../commons';
import { templatedMjmlEmailer } from '../../../implementations/programs';
import { SimpleSMTPConfig } from '../../../implementations/senders';
import { isNonEmptyArray, MailessError, NonEmptyArray, readFile } from '../../../prelude';
import { flattenUploadedFiles } from '../index';

/**
 * Provides an encoding for desired input for this endpoint.
 */
interface Input {
  smtpConfig: SimpleSMTPConfig;
  subject: string;
  from: Address;
  recipients: NonEmptyArray<Recipient>;
  attachments: Attachments;
  context: any;
  mjmTemplate: string;
  txtTemplate?: string;
}

/**
 * Filters files with the given field name.
 *
 * @param fieldname Field name.
 * @param files Files to filter.
 */
function getFilesByFieldName(fieldname: string, files: Array<Express.Multer.File>): Array<Express.Multer.File> {
  return files.filter((x) => x.fieldname == fieldname);
}

/**
 * Attempts to read the request and prepare the desited input for this endpoint.
 *
 * @param request HTTP Request.
 */
function readRequest(request: Request): Promise<Input> {
  // Get all uploaded files:
  const files = flattenUploadedFiles(request.files);

  // Get metadata file:
  const metadata = getFilesByFieldName('metadata', files)[0];

  // Get handlebars template file for MJML/HTML content:
  const mjmTemplate = getFilesByFieldName('templatemjm', files)[0];

  // Get handlebars template file for TXT content, if any:
  const txtTemplate = getFilesByFieldName('templatetxt', files)[0];

  // Get attachments:
  const attachments = getFilesByFieldName('attachments', files).map((x) => ({
    filename: x.originalname,
    path: x.path,
  }));

  // Check if we have missing files:
  if (metadata === undefined) {
    return Promise.reject(new MailessError('Required metadata file is not provided.'));
  } else if (mjmTemplate === undefined) {
    return Promise.reject(new MailessError('Required MJML/HTML template is not provided.'));
  }

  // Create promises of interest:
  const metadataReader = readFile(metadata.path, { encoding: 'utf8' });
  const mjmTemplateReader = readFile(mjmTemplate.path, { encoding: 'utf8' });
  const txtTemplateReader = txtTemplate ? readFile(txtTemplate.path, { encoding: 'utf8' }) : undefined;

  // Attempt to build the request input:
  return Promise.all([metadataReader, mjmTemplateReader, txtTemplateReader]).then(
    ([metadataC, mjmTemplate, txtTemplate]) => {
      // Read-in metadata:
      const metadata = JSON.parse(metadataC);

      // Check metadata fields:
      if (!metadata?.smtp.host) {
        throw new MailessError('Required metadata field "smtp.host" is not provided.');
      } else if (!metadata.subject) {
        throw new MailessError('Required metadata field "subject" is not provided.');
      } else if (!metadata.from) {
        throw new MailessError('Required metadata field "from" is not provided.');
      }

      // Get recipients:
      const recipients: Array<Recipient> = [
        ...(metadata.to || []).map((x: string) => ({ addr: x, type: RecipientType.To })),
        ...(metadata.cc || []).map((x: string) => ({ addr: x, type: RecipientType.Cc })),
        ...(metadata.bcc || []).map((x: string) => ({ addr: x, type: RecipientType.Bcc })),
      ];

      // Check recipients:
      if (!isNonEmptyArray(recipients)) {
        throw new MailessError('No recipient is provided');
      }

      // Done, return:
      return {
        smtpConfig: {
          host: metadata?.smtp.host,
          port: metadata?.smtp.port,
          user: metadata?.smtp?.username,
          pass: metadata?.smtp?.password,
          secure: metadata?.smtp?.secure,
        },
        subject: `${metadata.subject}`,
        from: `${metadata.from}`,
        recipients: recipients,
        context: metadata.context,
        attachments: attachments as Attachments,
        mjmTemplate,
        txtTemplate,
      };
    }
  );
}

/**
 * Provides the endpoint functionality.
 *
 * @param request HTTP request.
 * @param response HTTP response.
 */
export async function sendmail(request: Request, response: Response): Promise<void> {
  // Attempt to get input:
  readRequest(request)
    .then((input) => {
      // Compile the Mailess program:
      const program = templatedMjmlEmailer(input.smtpConfig, input.mjmTemplate, input.txtTemplate);

      // Run the Mailess program and return:
      program(input.subject, input.from, input.recipients, input.context, input.attachments).then(
        (ret) => response.send({ status: 'SUCCESS', data: ret }),
        (err) => {
          if (err instanceof MailessError) {
            response.status(400).send({ status: 'ERROR', data: err.message });
          } else {
            response.status(500).send({ status: 'ERROR', data: 'Unknown error' });
            console.error(err);
          }
        }
      );
    })
    .catch((err) => {
      if (err instanceof MailessError) {
        response.status(400).send({ status: 'ERROR', data: err.message });
      } else {
        response.status(500).send({ status: 'ERROR', data: 'Unknown error' });
        console.error(err);
      }
    });
}
