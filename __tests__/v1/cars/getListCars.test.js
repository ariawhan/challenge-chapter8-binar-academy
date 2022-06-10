const request = require("supertest"); // request with supertest
const app = require("../../../app"); // app for testing

describe("GET /v1/cars", () => {
  const page = 1;
  const pageSize = 1;

  it("should response with 200 as status code (sukses get list cars)", async () => {
    return request(app)
      .get("/v1/cars?page=" + page + "&pageSize=" + pageSize) // request api get cars with page in quary
      .then((res) => {
        expect(res.statusCode).toBe(200);
        // expect(res.body.cars).toEqual(
        //   expect.arrayContaining([
        //     expect.objectContaining({
        //       id,
        //       price,
        //       size,
        //       image,
        //       isCurrentlyRented,
        //       createdAt,
        //       updatedAt,
        //       userCar,
        //     }),
        //   ])
        // );
      });
  });
});
