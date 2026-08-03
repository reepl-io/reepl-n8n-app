import assert from 'node:assert/strict';
import { test } from 'node:test';
import { interpolatePath, parseJsonObject, getBaseUrl } from '../dist/nodes/Reepl/helpers.js';

test('parseJsonObject accepts n8n JSON values and JSON strings', () => {
  assert.deepEqual(parseJsonObject({ content: 'hello' }, 'body'), { content: 'hello' });
  assert.deepEqual(parseJsonObject('{"limit":3}', 'query'), { limit: 3 });
  assert.deepEqual(parseJsonObject('', 'body'), {});
});

test('parseJsonObject rejects arrays and malformed JSON', () => {
  assert.throws(() => parseJsonObject('[1, 2]', 'body'), /Invalid JSON for body/);
  assert.throws(() => parseJsonObject('{', 'body'), /Invalid JSON for body/);
});

test('interpolatePath URL-encodes path parameters and requires values', () => {
  assert.equal(interpolatePath('/external/posts/{postId}', { postId: 'post/123' }), '/external/posts/post%2F123');
  assert.throws(() => interpolatePath('/external/posts/{postId}', {}), /Missing path parameter: postId/);
});

test('getBaseUrl removes trailing slashes', () => {
  assert.equal(getBaseUrl({ baseUrl: 'https://example.test/v1///' }), 'https://example.test/v1');
});
