const request = require('supertest'); // request with supertest
const app = require('../../../app'); // app for testing

describe('GET /v1/cars', () => {
  const page = 1;
  const pageSize = 1;

  it('should response with 200 as status code (sukses get list cars)', async () => await request(app)
    .get(`/v1/cars?page=${page}&pageSize=${pageSize}`) // request api get cars with page in quary
    .then((res) => {
      expect(res.statusCode).toBe(200);
      expect(res.body.cars).toBeDefined();
      expect(res.body.meta.pagination).toEqual(
        expect.objectContaining({
          page: expect.any(String),
          pageCount: expect.any(Number),
          pageSize: expect.any(String),
          count: expect.any(Number),
        }),
      );
    }));
  it('should response with 200 as status code (sukses get list cars)', async () => await request(app)
    .get('/v1/cars?size=SMALL&availableAt=2022-06-11T16:06:28.559Z') // request api get cars with page in quary
    .then((res) => {
      expect(res.statusCode).toBe(200);
      expect(res.body.meta.pagination).toEqual(
        expect.objectContaining({
          page: expect.any(Number),
          pageCount: expect.any(Number),
          pageSize: expect.any(Number),
          count: expect.any(Number),
        }),
      );
    }));
});
