import { renderMjml } from './mjml';

test('can compile MJML documents', () => {
  expect(renderMjml('<mjml><mj-body></mj-body></mjml>')).toMatch('<!doctype html>');
});
