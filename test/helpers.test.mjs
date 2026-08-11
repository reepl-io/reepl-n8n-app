import assert from 'node:assert/strict';
import { test } from 'node:test';
import { interpolatePath, parseJsonObject, getBaseUrl } from '../dist/nodes/Reepl/helpers.js';
import { ReeplApi } from '../dist/credentials/ReeplApi.credentials.js';

const testNode = {};

test('Reepl API credentials include a connection test request', () => {
  const credential = new ReeplApi();

  assert.equal(credential.test.request.method, 'GET');
  assert.equal(credential.test.request.url, '/external/me');
});

test('parseJsonObject accepts n8n JSON values and JSON strings', () => {
  assert.deepEqual(parseJsonObject({ content: 'hello' }, 'body', undefined, testNode), { content: 'hello' });
  assert.deepEqual(parseJsonObject('{"limit":3}', 'query', undefined, testNode), { limit: 3 });
  assert.deepEqual(parseJsonObject('', 'body', undefined, testNode), {});
});

test('parseJsonObject rejects arrays and malformed JSON', () => {
  assert.throws(() => parseJsonObject('[1, 2]', 'body', undefined, testNode), /Invalid JSON for body/);
  assert.throws(() => parseJsonObject('{', 'body', undefined, testNode), /Invalid JSON for body/);
});

test('interpolatePath URL-encodes path parameters and requires values', () => {
  assert.equal(interpolatePath('/external/posts/{postId}', { postId: 'post/123' }, testNode), '/external/posts/post%2F123');
  assert.throws(() => interpolatePath('/external/posts/{postId}', {}, testNode), /Missing path parameter: postId/);
});

test('getBaseUrl removes trailing slashes', () => {
  assert.equal(getBaseUrl({ baseUrl: 'https://example.test/v1///' }), 'https://example.test/v1');
});
