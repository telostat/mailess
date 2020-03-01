import handlebars from 'handlebars';
// @ts-ignore
import markdown from 'helper-markdown';

// Register `markdown` handlerbars helper:
handlebars.registerHelper('markdown', markdown());

/**
 * Renders the given template with given content.
 *
 * @param template Template to render.
 * @param context Context object to render template with.
 * @returns Rendered content.
 * @throws Error in case of template error.
 */
export function renderHbs<T>(template: string, context: T): string {
  return handlebars.compile(template, {})(context);
}
