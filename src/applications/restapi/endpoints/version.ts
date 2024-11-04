import { Request, Response } from 'express';
import pjson from '../../../../package.json';

/**
 * Provides the endpoint functionality.
 *
 * @param request HTTP request.
 * @param response HTTP response.
 */
export async function version(_request: Request, response: Response): Promise<void> {
  response.json({ version: pjson.version });
}
