import express from 'express';
import multer from 'multer';
import { notification } from './endpoints/notification';
import { sendmail } from './endpoints/sendmail';
import { version } from './endpoints/version';

/**
 * Provides an encoding for named file uploads.
 */
interface NamedFileUploads {
  [fieldname: string]: Express.Multer.File[];
}

/**
 * Provides an encoding for file uploads.
 */
type FileUploads = NamedFileUploads | Express.Multer.File[];

/**
 * Flattens uploaded files into an [[Array]] of [[Attachment]] instances.
 *
 * @param files Uploaded files.
 * @returns An [[Array]] of [[Attachment]] instances.
 */
export function flattenUploadedFiles(files: FileUploads): Array<Express.Multer.File> {
  if (files instanceof Array) {
    return files;
  } else {
    return [
      ...(files.metadata || []),
      ...(files.templatemjm || []),
      ...(files.templatetxt || []),
      ...(files.attachments || []),
    ];
  }
}

/**
 * Provides an encoding for REST API application configuration.
 */
export interface AppConfig {
  /** HTTP port to serve the application from. */
  httpport: number;

  /** Directory of files upload. */
  uploads: string;
}

/**
 * Runs the REST API application.
 *
 * @param config REST API application configuration.
 * @returns Nothing. This is a blocking call to the mainloop of the Express framework.
 */
export function runApplication(config: AppConfig): void {
  // Create the application:
  const app = express();

  // Create the middleware factory for file uploads:
  const uploadsMiddlewareFactory = multer({ dest: config.uploads });

  // Configure and get the file upload middleware:
  const uploadsMiddleware = uploadsMiddlewareFactory.fields([
    { name: 'metadata', maxCount: 1 },
    { name: 'templatemjm', maxCount: 1 },
    { name: 'templatetxt', maxCount: 1 },
    { name: 'attachments' },
  ]);

  // Define endpoints:
  app.get('/version', version);
  app.post('/sendmail', uploadsMiddleware, sendmail);
  app.post('/notification', uploadsMiddleware, notification);

  // Run the express application (blocking):
  app.listen(config.httpport, () => console.log(`Example app listening on port ${config.httpport}!`));
}
