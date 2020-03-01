import mjml2html from 'mjml';

/**
 * Renders given MJML content to HTML content.
 *
 * @param mjml MJML content.
 * @returns HTML content.
 */
export function renderMjml<T>(mjml: string): string {
  return mjml2html(mjml).html;
}
