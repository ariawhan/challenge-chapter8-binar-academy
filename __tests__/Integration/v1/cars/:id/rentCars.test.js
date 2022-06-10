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
  const userRentCustomer = {
    name: "Customer Rent Test",
    email: "customerrent@mail.test",
    encryptedPassword: bcrypt.hashSync(password, 10), // hash of password
    roleId: 1, // admin role 1
  };
  beforeEach(async () => {
    // create user admin and customer and crate car before it
    await User.create(userRentAdmin);
    await User.create(userRentCustomer);
    const addCar = await Car.create(carDataRent);
    idCarsRent = addCar.id;
  });

  afterEach(async () => {
    // delete user admin and customer after it
    try {
      await User.destroy({
        where: {
          email: userRentAdmin.email,
        },
      });
      await User.destroy({
        where: {
          email: userRentCustomer.email,
        },
      });
      await Car.destroy({
        where: {
          id: idCarsRent,
        },
      });
    } catch (err) {
      console.error(err.message); // error message
    }
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
});
