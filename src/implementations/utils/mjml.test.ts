import { renderMjml } from './mjml';

test('can compile MJML documents', () => {
  expect(renderMjml('<mjml></mjml>')).toMatch('<!doctype html>');
});
