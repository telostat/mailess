import { Request, Response } from 'express';
import { Address, Attachments, Recipient, RecipientType } from '../../../commons';
import { templatedMjmlEmailer } from '../../../implementations/programs';
import { isNonEmptyArray, MailessError, NonEmptyArray, readFile } from '../../../prelude';
import { flattenUploadedFiles } from '../index';

/**
 * Defines the MJML/HTML template.
 */
const mjmTemplate = `<mjml>
  <mj-head>
    {{#if title}}
      <mj-title>{{title}}</mj-title>
    {{/if}}
    {{#if preview}}
      <mj-preview>{{preview}}</mj-preview>
    {{/if}}
    <mj-attributes>
      <mj-all font-family="Montserrat, Helvetica, Arial, sans-serif"></mj-all>
      <mj-text font-weight="400" font-size="16px" color="#333333" line-height="24px"></mj-text>
    </mj-attributes>
    <mj-style inline="inline">
      .x-container {
        -webkit-box-shadow: 0px 0px 12px 2px rgba(0, 0, 0, 0.10);
        -moz-box-shadow: 0px 0px 12px 2px rgba(0, 0, 0, 0.10);
        box-shadow: 0px 0px 12px 2px rgba(0, 0, 0, 0.10);
        border-radius: 2px;
        background-color: white;
        border: 1px solid #E9E9E9;
        width: 600px;
      }
    </mj-style>
  </mj-head>

  <mj-body background-color="#F2F2F2">
    {{#if logo}}
      <mj-column width="100%" padding-top="20px">
        {{#if logowidth}}
          <mj-image width="{{logowidth}}" src="{{logo}}" />
        {{else}}
          <mj-image width="180px" src="{{logo}}" />
        {{/if}}
      </mj-column>
    {{/if}}

    <mj-wrapper padding-top="20px">
      <mj-section css-class="x-container">
        <mj-column width="100%" css-class="markdown-content">
          <mj-text>
            {{#markdown}}{{body}}{{/markdown}}
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-wrapper>

    {{#if notes}}
      <mj-section padding="0px 0 10px 0">
        <mj-column>
          <mj-text color="#7B7B7B" font-size="11px" line-height="16px" padding-right="5px" padding-left="5px">
            {{#markdown}}{{notes}}{{/markdown}}
          </mj-text>
        </mj-column>
      </mj-section>
    {{/if}}

    {{#if footer}}
      <mj-section padding="0px 0 20px 0">
        <mj-column>
          <mj-text align="center" color="#9B9B9B" font-size="11px" line-height="16px" padding="0px 0px 5px 0px">
            {{#markdown}}{{footer}}{{/markdown}}
          </mj-text>
        </mj-column>
      </mj-section>
    {{/if}}
  </mj-body>
</mjml>
`;

/**
 * Defines the TXT template.
 */
const txtTemplate = `{{body}}

{{notes}}

{{footer}}
`;

/**
 * Provides an encoding for desired input for this endpoint.
 */
interface Input {
  subject: string;
  from: Address;
  recipients: NonEmptyArray<Recipient>;
  attachments: Attachments;
  context: any;
  mjmTemplate: string;
  txtTemplate: string;
}

/**
 * Filters files with the given field name.
 *
 * @param fieldname Field name.
 * @param files Files to filter.
 */
function getFilesByFieldName(fieldname: string, files: Array<Express.Multer.File>): Array<Express.Multer.File> {
  return files.filter(x => x.fieldname == fieldname);
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

  // Get attachments:
  const attachments = getFilesByFieldName('attachments', files).map(x => ({ filename: x.originalname, path: x.path }));

  // Check if we have missing files:
  if (metadata === undefined) {
    return Promise.reject(new MailessError('Required metadata file is not provided.'));
  }

  // Create promises of interest:
  const metadataReader = readFile(metadata.path, { encoding: 'utf8' });

  // Attempt to build the request input:
  return Promise.all([metadataReader]).then(([metadataC]) => {
    // Read-in metadata:
    const metadata = JSON.parse(metadataC);

    // Check metadata fields:
    if (!metadata.subject) {
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
      subject: `${metadata.subject}`,
      from: `${metadata.from}`,
      recipients: recipients,
      context: metadata.context,
      attachments: attachments as Attachments,
      mjmTemplate,
      txtTemplate,
    };
  });
}

/**
 * Provides the endpoint functionality.
 *
 * @param request HTTP request.
 * @param response HTTP response.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function notification(request: Request, response: Response) {
  // Attempt to get input:
  readRequest(request)
    .then(input => {
      // Get environment variables:
      const host = process.env.MAILESS_HOST || 'localhost';
      const port = Number(process.env.MAILESS_PORT || '1025');
      const user = process.env.MAILESS_USERNAME || 'u';
      const pass = process.env.MAILESS_PASSWORD || 'p';

      // Compile the Mailess program:
      const program = templatedMjmlEmailer({ host, port, user, pass }, input.mjmTemplate, input.txtTemplate);

      // Run the Mailess program and return:
      program(input.subject, input.from, input.recipients, input.context, input.attachments).then(
        ret => response.send({ status: 'SUCCESS', data: ret }),
        err => {
          if (err instanceof MailessError) {
            response.status(400).send({ status: 'ERROR', data: err.message });
          } else {
            response.status(500).send({ status: 'ERROR', data: 'Unknown error' });
            console.error(err);
          }
        }
      );
    })
    .catch(err => {
      if (err instanceof MailessError) {
        response.status(400).send({ status: 'ERROR', data: err.message });
      } else {
        response.status(500).send({ status: 'ERROR', data: 'Unknown error' });
        console.error(err);
      }
    });
}
