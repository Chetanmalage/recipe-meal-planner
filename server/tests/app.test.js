const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server');

async function withServer(run) {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  try { await run(`http://127.0.0.1:${server.address().port}`); }
  finally { await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())); }
}

test('health endpoint reports API availability without connecting a database during import', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/health`);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.equal(body.status, 'ok');
    assert.ok(['connected', 'disconnected'].includes(body.database));
  });
});

test('unknown API routes return the project error envelope', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/no-such-route`);
    const body = await response.json();
    assert.equal(response.status, 404);
    assert.equal(body.success, false);
    assert.match(body.message, /Not Found/);
  });
});
