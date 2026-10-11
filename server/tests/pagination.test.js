const test = require('node:test');
const assert = require('node:assert/strict');
const paginate = require('../utils/pagination');

function fakeModel(items, total) {
  const calls = { filter: null, sort: null, skip: null, limit: null, populate: null };
  const query = {
    sort(value) { calls.sort = value; return this; },
    skip(value) { calls.skip = value; return this; },
    limit(value) { calls.limit = value; return this; },
    populate(value) { calls.populate = value; return Promise.resolve(items); },
  };
  return {
    calls,
    find(filter) { calls.filter = filter; return query; },
    countDocuments(filter) { calls.countFilter = filter; return Promise.resolve(total); },
  };
}

test('paginate applies requested page, limit, sort, populate and total metadata', async () => {
  const model = fakeModel([{ id: 1 }], 25);
  const result = await paginate(model, {}, { page: '2', limit: '10', filter: { category: 'Dinner' }, populate: 'author' });
  assert.equal(model.calls.skip, 10);
  assert.equal(model.calls.limit, 10);
  assert.equal(model.calls.sort, '-createdAt');
  assert.equal(model.calls.populate, 'author');
  assert.deepEqual(model.calls.filter, { category: 'Dinner' });
  assert.deepEqual(result.pagination, { total: 25, page: 2, pages: 3, limit: 10 });
});

test('paginate safely clamps invalid and excessive query values', async () => {
  const model = fakeModel([], 0);
  const result = await paginate(model, {}, { page: '-3', limit: '500' });
  assert.equal(model.calls.skip, 0);
  assert.equal(model.calls.limit, 50);
  assert.equal(result.pagination.page, 1);
  assert.equal(result.pagination.pages, 0);
});

test('search terms are escaped before becoming regular expressions', () => {
  const { escapeRegex } = require('../controllers/recipeController');
  const expression = new RegExp(escapeRegex('a.*[b]'), 'i');
  assert.equal(expression.test('a.*[b]'), true);
  assert.equal(expression.test('aaaaa b'), false);
});
