const request = require("supertest"); // request with supertest
const bcrypt = require("bcryptjs"); // bcrypt for hash password
const app = require("../../../../../app"); // app for testing
const { User, Car } = require("../../../../../app/models"); // user model for authentication

describe("GET /v1/cars/:id", () => {
  //car data
  const carData = {
    name: "Rush 2018",
    price: 600000,
    size: "SMALL",
    image: "https://source.unsplash.com/502x502",
    isCurrentlyRented: false,
  };

  //car data for update
  const carUpdate = {
    name: "Rush 2018 update",
    price: 6000000,
    size: "SMALL update",
    image: "https://source.unsplash.com/502x502",
  };

  let idCars = 0;

  // password admin and customer
  const password = "Hati-hati-dijalan";
  // data admin for authentication to get token admin
  const userAdmin = {
    name: "Admin Update Test",
    email: "adminupdate@mail.test",
    encryptedPassword: bcrypt.hashSync(password, 10), // hash of password
    roleId: 2, // admin role 2
  };
  // data customer for authentication to get token customer
  const userCustomer = {
    name: "Customer Update Test",
    email: "customerupdate@mail.test",
    encryptedPassword: bcrypt.hashSync(password, 10), // hash of password
    roleId: 1, // admin role 1
  };
  beforeEach(async () => {
    // create user admin and customer and crate car before it
    await User.create(userAdmin);
    await User.create(userCustomer);
    const addCar = await Car.create(carData);
    idCars = addCar.id;
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
      await Car.destroy({
        where: {
          id: idCars,
        },
      });
    } catch (err) {
      console.error(err.message); // error message
    }
  });

  it("should response with 401 as status code (userCustomer cannot be update car)", async () => {
    return await request(app)
      .post("/v1/auth/login") // request api login
      .set("Content-Type", "application/json")
      .send({ email: userCustomer.email, password: password }) // need email and password for login userCustomer
      .then((res) => {
        request(app)
          .put("/v1/cars/" + idCars) // request api create cars
          .set("authorization", "Bearer " + res.body.accessToken) // set authorization jwt
          .send(carUpdate)
          .then((res2) => {
            // console.log(res2.body);
            expect(res2.statusCode).toBe(401); // check status respond
            expect(res2.body).toEqual({
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
  it("should response with 201 as status code sukses update cars by admin", async () => {
    return await request(app)
      .post("/v1/auth/login") // request api login
      .set("Content-Type", "application/json")
      .send({ email: userAdmin.email, password: password }) // need email and password for login userCustomer
      .then((res) => {
        request(app)
          .put("/v1/cars/" + idCars) // request api create cars
          .set("authorization", "Bearer " + res.body.accessToken) // set authorization jwt
          .send(carUpdate)
          .then((res2) => {
            expect(res2.statusCode).toBe(201); // check status respond
            expect(res2.body.message).toEqual(
              "succesfully updated id " + idCars
            );
            expect(res2.body.data.id), toEqual(idCars);
            expect(res2.body.data.name), toEqual(carUpdate.name);
            expect(res2.body.data.price), toEqual(carUpdate.price);
            expect(res2.body.data.size), toEqual(carUpdate.size);
            expect(res2.body.data.image), toEqual(carUpdate.image);
          });
      });
  });
});
