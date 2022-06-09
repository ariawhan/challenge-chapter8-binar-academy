const request = require("supertest"); // request with supertest
const app = require("../../../app"); // app for testing
// const { Car } = require("../../../app/models"); // user model for authentication

describe("GET /v1/cars", () => {
  // data cars for create before it
  //   const listCars = {
  //     name: "Rush 2019",
  //     price: 600000,
  //     size: "SMALL",
  //     image: "https://source.unsplash.com/502x502",
  //     isCurrentlyRented: false,
  //   };

  //   let carAfterCreate = {};
  const page = 1;
  const pageSize = 1;

  //   beforeEach(async () => {
  //     // Create car before test
  //     carAfterCreate = await Car.create(listCars);
  //   });

  //   afterEach(async () => {
  //     await Car.destroy({ where: { id: carAfterCreate.id } });
  //   });

  it("should response with 200 as status code (sukses get list cars)", async () => {
    return request(app)
      .get("/v1/cars?page=" + page + "&pageSize=" + pageSize) // request api get cars with page in quary
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body.cars).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id,
              price,
              size,
              image,
              isCurrentlyRented,
              createdAt,
              updatedAt,
              userCar,
            }),
          ])
        );
      })
      .catch((err) => {
        console.log(err);
      });
  });
});
