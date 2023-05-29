import { htmlToText as asTxt } from 'html-to-text';
import { Renderer } from '../algebra';
import { MailessError } from '../prelude';
import { Content } from './generic';
import { renderHbs } from './utils/handlebars';
import { renderMjml } from './utils/mjml';

/**
 * Provides a type alias for generic renderers defined in this module.
 */
export type GenericRenderer<P> = Renderer<P, Content>;

/**
 * Provides an `identity` content renderer.
 *
 * @param x Content.
 */
export const FullMailRenderer: GenericRenderer<Content> = (x: Content) => Promise.resolve(x);

/**
 * Provides a no-content renderer.
 */
export const NoContentRenderer: GenericRenderer<void> = () => Promise.resolve({});

/**
 * Provides a TXT-only content renderer.
 *
 * @param x TXT content.
 */
export const TextMailRenderer: GenericRenderer<string> = (x: string) => Promise.resolve({ text: x });

/**
 * Provides a renderer which consumes HTML-only content and produces both TXT and HTML content.
 *
 * @param x HTML content.
 */
export const HtmlMailRenderer: GenericRenderer<string> = (x: string) =>
  Promise.resolve({ text: asTxt(x, { wordwrap: 120 }), html: x });

/**
 * Creates a HTML and TXT content renderer for given templates.
 *
 * @param htmTemplate MJML-powered Handlebars template for HTML content.
 * @param txtTemplate Handlebars template for TXT content.
 */
export function makeHandlebarsMjmlRenderer<T>(htmTemplate: string, txtTemplate?: string): GenericRenderer<T> {
  return (payload: T): Promise<Content> => {
    try {
      // Get HTML content:
      const html = renderMjml(renderHbs(htmTemplate, payload));

      // Attempt to get TXT content:
      const text = txtTemplate ? renderHbs(txtTemplate, payload) : asTxt(html, { wordwrap: 120 });

      // Compile the generic content and return:
      return Promise.resolve({ text, html });
    } catch (exc: any) {
      return Promise.reject(new MailessError('Can not render email content', exc));
    }
  };
}
