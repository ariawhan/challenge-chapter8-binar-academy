const request = require("supertest"); // request with supertest
const bcrypt = require("bcryptjs"); // bcrypt for hash password
const app = require("../../../../../app"); // app for testing
const { User, Car } = require("../../../../../app/models"); // user model for authentication

describe("POST /v1/cars/:id/rent", () => {
  //car data
  const carDataRent = {
    name: "Rush 2018",
    price: 600000,
    size: "SMALL",
    image: "https://source.unsplash.com/502x502",
    isCurrentlyRented: false,
  };

  //car data for rent cars
  const rentData = {
    rentStartedAt: "2022-06-09T15:44:03.156Z",
    rentEndedAt: "2022-06-09T15:44:03.156Z",
  };

  let idCarsRent = 0;

  const idCarNotFound = 1000;

  // password admin and customer
  const password = "Hati-hati-dijalan";
  // data admin for authentication to get token admin
  const userRentAdmin = {
    name: "Admin Rent Test",
    email: "adminrent@mail.test",
    encryptedPassword: bcrypt.hashSync(password, 10), // hash of password
    roleId: 2, // admin role 2
  };
  // data customer for authentication to get token customer
  const userRentCustomerRent = {
    name: "Customer Rent Test",
    email: "customerrent@gmail.com",
    encryptedPassword: bcrypt.hashSync(password, 10), // hash of password
    roleId: 1, // admin role 1
  };
  beforeEach(async () => {
    // create user admin and customer and crate car before it
    await User.create(userRentAdmin);
    await User.create(userRentCustomerRent);
    const addCar = await Car.create(carDataRent);
    idCarsRent = addCar.id;
    const findNotFoundCars = await Car.findByPk(idCarNotFound);
    if (findNotFoundCars) {
      await Car.destroy({
        where: {
          id: idCarNotFound,
        },
      });
    }
  });

  afterEach(async () => {
    // delete user admin and customer after it
    await User.destroy({
      where: {
        email: userRentAdmin.email.toLowerCase(),
      },
    });
    // await User.destroy({
    //   where: {
    //     email: userRentCustomerRent.email.toLowerCase(),
    //   },
    // });
    // await Car.destroy({
    //   where: {
    //     id: idCarsRent,
    //   },
    // });
  });

  it("should response with 401 as status code (userAdmin cannot be update car)", async () => {
    return await request(app)
      .post("/v1/auth/login") // request api login
      .set("Content-Type", "application/json")
      .send({ email: userRentAdmin.email, password: password }) // need email and password for login userCustomer
      .then(async (res) => {
        await request(app)
          .post("/v1/cars/" + idCarsRent + "/rent") // request api create cars
          .set("authorization", "Bearer " + res.body.accessToken) // set authorization jwt
          .send(rentData)
          .then(async (res2) => {
            await expect(res2.statusCode).toBe(401); // check status respond
            await expect(res2.body).toEqual({
              error: {
                name: "Error",
                message: "Access forbidden!",
                details: {
                  role: "ADMIN",
                  reason: "ADMIN is not allowed to perform this operation.",
                },
              },
            });
          });
      });
  });
  it("should response with 404 as status code (Cars not found for rent)", async () => {
    return await request(app)
      .post("/v1/auth/login") // request api login
      .set("Content-Type", "application/json")
      .send({ email: userRentCustomerRent.email, password: password }) // need email and password for login userCustomer
      .then(async (res) => {
        await request(app)
          .post("/v1/cars/" + idCarNotFound + "/rent") // request api create cars
          .set("authorization", "Bearer " + res.body.accessToken) // set authorization jwt
          .send(rentData)
          .then(async (notFoundCarsRent) => {
            await expect(notFoundCarsRent.statusCode).toBe(404); // check status respond
            await expect(notFoundCarsRent.body.error.message).toEqual(
              "Not found car!"
            );
          });
      });
  });
  it("should response with 201 as status code (Suksess Rent Cars)", async () => {
    return await request(app)
      .post("/v1/auth/login") // request api login
      .set("Content-Type", "application/json")
      .send({ email: userRentCustomerRent.email, password: password }) // need email and password for login userCustomer
      .then(async (res) => {
        await request(app)
          .post("/v1/cars/" + idCarsRent + "/rent") // request api create cars
          .set("authorization", "Bearer " + res.body.accessToken) // set authorization jwt
          .send(rentData)
          .then(async (notFoundCarsRent) => {
            await expect(notFoundCarsRent.statusCode).toBe(201); // check status respond
            await expect(notFoundCarsRent.body.carId).toBe(idCarsRent); // check status respond
          });
      });
  });
  it("should response with 422 as status code (al)", async () => {
    return await request(app)
      .post("/v1/auth/login") // request api login
      .set("Content-Type", "application/json")
      .send({ email: userRentCustomerRent.email, password: password }) // need email and password for login userCustomer
      .then(async (res) => {
        await request(app)
          .post("/v1/cars/" + idCarsRent + "/rent") // request api create cars
          .set("authorization", "Bearer " + res.body.accessToken) // set authorization jwt
          .send(rentData)
          .then(async () => {
            await request(app)
              .post("/v1/cars/" + idCarsRent + "/rent") // request api create cars
              .set("authorization", "Bearer " + res.body.accessToken) // set authorization jwt
              .send(rentData)
              .then(async (alreadyRent) => {
                await expect(alreadyRent.statusCode).toBe(422); // check status respond
                await expect(alreadyRent.body.error.message).toEqual(
                  "Car is already rented!!"
                );
              });
          });
      });
  });
});
