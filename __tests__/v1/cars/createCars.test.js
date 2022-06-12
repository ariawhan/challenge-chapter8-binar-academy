const request = require("supertest"); // request with supertest
const bcrypt = require("bcryptjs"); // bcrypt for hash password
const app = require("../../../app"); // app for testing
const { User, Car } = require("../../../app/models"); // user model for authentication

describe("GET /v1/cars", () => {
  //car data
  const carData = {
    name: "Rush 2019",
    price: 600000,
    size: "SMALL",
    image: "https://source.unsplash.com/502x502",
    isCurrentlyRented: false,
  };
  // data car price not number
  const carDataInvalid = {
    name: "Rush 2019",
    price: "limaribu",
    size: "SMALL",
    image: "https://source.unsplash.com/502x502",
    isCurrentlyRented: false,
  };

  let idCars = "";

  // password admin and customer
  const password = "Hati-hati-dijalan";
  // data admin for authentication to get token admin
  const userAdmin = {
    name: "Admin Create Cars Test",
    email: "admincreatecars@mail.com",
    encryptedPassword: bcrypt.hashSync(password, 10), // hash of password
    roleId: 2, // admin role 2
  };
  // data customer for authentication to get token customer
  const userCustomer = {
    name: "Customer Create Cars Test",
    email: "customercreatecars@mail.com",
    encryptedPassword: bcrypt.hashSync(password, 10), // hash of password
    roleId: 1, // admin role 1
  };
  beforeEach(async () => {
    // create user admin and customer befor It
    try {
      await User.create(userAdmin);
      await User.create(userCustomer);
    } catch (err) {
      console.error(err.message); // error message
    }
  });

  afterEach(async () => {
    // delete user admin and customer after it
    try {
      await User.destroy({
        where: {
          email: userAdmin.email,
        },
      });
      await User.destroy({
        where: {
          email: userCustomer.email,
        },
      });
      //   await Car.destroy({
      //     where: {
      //       id: parseInt(idCars),
      //     },
      //   });
    } catch (err) {
      console.error(err.message); // error message
    }
  });

  it("should response with 401 as status code (userCustomer cannot be create car)", async () => {
    return request(app)
      .post("/v1/auth/login") // request api login
      .set("Content-Type", "application/json")
      .send({ email: userCustomer.email, password: password }) // need email and password for login userCustomer
      .then((res) => {
        request(app)
          .post("/v1/cars") // request api create cars
          .set("authorization", "Bearer " + res.body.accessToken) // set authorization jwt
          .send(carData)
          .then((res) => {
            expect(res.statusCode).toBe(401); // check status respond
            expect(res.body).toEqual({
              error: {
                name: "Error",
                message: "Access forbidden!",
                details: {
                  role: "CUSTOMER",
                  reason: "CUSTOMER is not allowed to perform this operation.",
                },
              },
            }); // check error Access forbidden
          });
      });
  });
  it("should response with 201 as status code sukses create cars by admin", async () => {
    return request(app)
      .post("/v1/auth/login") // request api login
      .set("Content-Type", "application/json")
      .send({ email: userAdmin.email, password: password }) // need email and password for login userCustomer
      .then((res) => {
        request(app)
          .post("/v1/cars") // request api create cars
          .set("authorization", "Bearer " + res.body.accessToken) // set authorization jwt
          .send(carData)
          .then((res2) => {
            expect(res2.statusCode).toBe(201); // check status respond
            expect(res2.body.name).toEqual(carData.name);
            expect(res2.body.price).toEqual(carData.price);
            expect(res2.body.size).toEqual(carData.size);
            expect(res2.body.image).toEqual(carData.image);
            expect(res2.body.isCurrentlyRented).toEqual(
              carData.isCurrentlyRented
            );
            idCars = res.body.id;
          });
      });
  });
  it("should response with 422 as status code price must be number", async () => {
    return request(app)
      .post("/v1/auth/login") // request api login
      .set("Content-Type", "application/json")
      .send({ email: userAdmin.email, password: password }) // need email and password for login userCustomer
      .then((res) => {
        request(app)
          .post("/v1/cars") // request api create cars
          .set("authorization", "Bearer " + res.body.accessToken) // set authorization jwt
          .send(carDataInvalid)
          .then((res2) => {
            expect(res2.statusCode).toBe(422); // check status respond
            expect(res2.body.error.message).toEqual("Price must be number!");
          });
      });
  });
});
