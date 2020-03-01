import { renderHbs } from './handlebars';

test('can render Handlebars templates', () => {
  expect(renderHbs('Hello {{name}}!', { name: 'World' })).toEqual('Hello World!');
});
