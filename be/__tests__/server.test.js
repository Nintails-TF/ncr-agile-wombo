const request = require('supertest');
const app = require('../server'); 

describe('GET /', () => {
  it('responds with Hello World!', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain('Hello World!');
  });
});
