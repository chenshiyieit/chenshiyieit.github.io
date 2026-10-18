import { test } from 'node:test';
import assert from 'node:assert/strict';
import { comparePeople } from '../src/lib/people-order.mjs';

test('a last-pinned member stays after future members regardless of their numeric order', () => {
  const members = [
    { name: 'Pinned member', data: { order: 2, last: true } },
    { name: 'Future member', data: { order: 10000 } },
    { name: 'Shengqi Zhang', data: { order: 1 } },
    { name: 'Yanji Wei', data: { order: 2 } },
  ];
  assert.deepEqual(members.sort(comparePeople).map((member) => member.name), ['Shengqi Zhang', 'Yanji Wei', 'Future member', 'Pinned member']);
});
