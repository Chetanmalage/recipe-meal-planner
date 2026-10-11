const test = require('node:test');
const assert = require('node:assert/strict');
const User = require('../models/User');
const { getFavourites } = require('../controllers/userController');

test('getFavourites projects cooking time and populates the recipe author name', async () => {
  const originalFindById = User.findById;
  const populateCalls = [];
  const query = {
    populate(options) {
      populateCalls.push(options);
      return this;
    },
    then(resolve, reject) {
      return Promise.resolve({ favourites: [] }).then(resolve, reject);
    },
  };
  let body;
  let delegatedError;
  User.findById = (id) => {
    assert.equal(id, 'user-id');
    return query;
  };
  const response = {
    status(code) { this.statusCode = code; return this; },
    json(payload) { body = payload; return this; },
  };

  try {
    await getFavourites({ user: { _id: 'user-id' } }, response, (error) => { delegatedError = error; });
  } finally {
    User.findById = originalFindById;
  }

  assert.ifError(delegatedError);
  assert.equal(populateCalls.length, 1);
  assert.deepEqual(populateCalls[0], {
    path: 'favourites',
    select: 'title imageUrl category rating numReviews description prepTime cookTime author',
    populate: { path: 'author', select: 'name' },
  });
  assert.deepEqual(body, { success: true, recipes: [] });
});
