const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const app = require('../server');

async function withServer(run) {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  try { await run(`http://127.0.0.1:${server.address().port}`); }
  finally { await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())); }
}

const postGoogle = (baseUrl) => fetch(`${baseUrl}/api/auth/google`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ credential: 'x'.repeat(180) }),
});

test('Google sign-in reports missing server configuration without leaking credentials', async () => {
  const originalClientId = process.env.GOOGLE_CLIENT_ID;
  delete process.env.GOOGLE_CLIENT_ID;
  try {
    await withServer(async (baseUrl) => {
      const response = await postGoogle(baseUrl);
      const body = await response.json();
      assert.equal(response.status, 503);
      assert.equal(body.success, false);
      assert.match(body.message, /not configured/i);
    });
  } finally {
    if (originalClientId === undefined) delete process.env.GOOGLE_CLIENT_ID;
    else process.env.GOOGLE_CLIENT_ID = originalClientId;
  }
});

test('Google sign-in rejects an ID token that Google cannot verify', async () => {
  const originalClientId = process.env.GOOGLE_CLIENT_ID;
  const originalVerify = OAuth2Client.prototype.verifyIdToken;
  process.env.GOOGLE_CLIENT_ID = 'test-web-client-id';
  OAuth2Client.prototype.verifyIdToken = async () => { throw new Error('private verifier detail'); };
  try {
    await withServer(async (baseUrl) => {
      const response = await postGoogle(baseUrl);
      const body = await response.json();
      assert.equal(response.status, 401);
      assert.equal(body.success, false);
      assert.doesNotMatch(body.message, /private verifier detail/);
    });
  } finally {
    OAuth2Client.prototype.verifyIdToken = originalVerify;
    if (originalClientId === undefined) delete process.env.GOOGLE_CLIENT_ID;
    else process.env.GOOGLE_CLIENT_ID = originalClientId;
  }
});

test('Google sign-in creates an app account only from a verified ID token and issues the app JWT', async () => {
  const originalClientId = process.env.GOOGLE_CLIENT_ID;
  const originalJwtSecret = process.env.JWT_SECRET;
  const originalVerify = OAuth2Client.prototype.verifyIdToken;
  const originalFindOne = User.findOne;
  const originalCreate = User.create;
  process.env.GOOGLE_CLIENT_ID = 'test-web-client-id';
  process.env.JWT_SECRET = 'test-secret-with-at-least-thirty-two-characters';
  OAuth2Client.prototype.verifyIdToken = async ({ idToken, audience }) => {
    assert.equal(idToken, 'x'.repeat(180));
    assert.equal(audience, 'test-web-client-id');
    return { getPayload: () => ({ sub: 'google-subject-123', email: 'cook@example.com', email_verified: true, name: 'Home Cook' }) };
  };
  User.findOne = (query) => {
    if (query.googleId) return Promise.resolve(null);
    return { select: async () => null };
  };
  User.create = async (values) => ({ _id: '507f1f77bcf86cd799439011', role: 'user', ...values });
  try {
    await withServer(async (baseUrl) => {
      const response = await postGoogle(baseUrl);
      const body = await response.json();
      assert.equal(response.status, 200);
      assert.equal(body.success, true);
      assert.equal(body.name, 'Home Cook');
      assert.equal(body.email, 'cook@example.com');
      assert.equal(body.role, 'user');
      assert.equal('googleId' in body, false);
      assert.equal(jwt.verify(body.token, process.env.JWT_SECRET).id, '507f1f77bcf86cd799439011');
    });
  } finally {
    OAuth2Client.prototype.verifyIdToken = originalVerify;
    User.findOne = originalFindOne;
    User.create = originalCreate;
    if (originalClientId === undefined) delete process.env.GOOGLE_CLIENT_ID;
    else process.env.GOOGLE_CLIENT_ID = originalClientId;
    if (originalJwtSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalJwtSecret;
  }
});

test('Google sign-in does not silently link an unverified third-party email domain to a local account', async () => {
  const originalClientId = process.env.GOOGLE_CLIENT_ID;
  const originalVerify = OAuth2Client.prototype.verifyIdToken;
  const originalFindOne = User.findOne;
  const originalCreate = User.create;
  let saveCalled = false;
  process.env.GOOGLE_CLIENT_ID = 'test-web-client-id';
  OAuth2Client.prototype.verifyIdToken = async () => ({
    getPayload: () => ({ sub: 'google-subject-456', email: 'cook@example.net', email_verified: true, name: 'Home Cook' }),
  });
  User.findOne = (query) => {
    if (query.googleId) return Promise.resolve(null);
    return { select: async () => ({ googleId: undefined, save: async () => { saveCalled = true; } }) };
  };
  User.create = async () => { throw new Error('Unexpected new account'); };
  try {
    await withServer(async (baseUrl) => {
      const response = await postGoogle(baseUrl);
      const body = await response.json();
      assert.equal(response.status, 409);
      assert.match(body.message, /email and password/i);
      assert.equal(saveCalled, false);
    });
  } finally {
    OAuth2Client.prototype.verifyIdToken = originalVerify;
    User.findOne = originalFindOne;
    User.create = originalCreate;
    if (originalClientId === undefined) delete process.env.GOOGLE_CLIENT_ID;
    else process.env.GOOGLE_CLIENT_ID = originalClientId;
  }
});
