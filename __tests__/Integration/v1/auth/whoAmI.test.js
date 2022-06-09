const request = require("supertest"); // request with supertest
const bcrypt = require("bcryptjs"); // bcrypt for hash password
const app = require("../../../../app"); // app for testing
const { User } = require("../../../../app/models"); // user model for authentication

describe("GET /v1/auth/whoami", () => {
  // password admin and customer
  const password = "Hati-hati-dijalan";
  // data admin for authentication to get token admin
  const userAdmin = {
    name: "Admin Test",
    email: "admin@mail.test",
    encryptedPassword: bcrypt.hashSync(password, 10), // hash of password
    roleId: 2, // admin role 2
  };
  // data customer for authentication to get token customer
  const userCustomer = {
    name: "Customer Test",
    email: "customer@mail.test",
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
    } catch (err) {
      console.error(err.message); // error message
    }
  });

  // cehcck who am i with admin account
  it("should response with 401 as status code", async () => {
    return request(app)
      .post("/v1/auth/login") // request api login
      .set("Content-Type", "application/json")
      .send({ email: userAdmin.email, password: password }) // need email and password for login userAdmin
      .then((res) => {
        request(app)
          .get("/v1/auth/whoami") // request api whoami
          .set("authorization", "Bearer " + res.body.accessToken) // set authorization jwt
          .then((res) => {
            expect(res.statusCode).toBe(401); // check status respond
            expect(res.body).toEqual({
              error: {
                name: "Error",
                message: "Access forbidden!",
                details: {
                  role: "ADMIN",
                  reason: "ADMIN is not allowed to perform this operation.",
                },
              },
            }); // check error Access forbidden
          })
          .catch((err) => {
            console.error(err.message); //error message;
          });
      });
  });
  // cehcck who am i with customer account
  it("should response with 200 as status code", async () => {
    return request(app)
      .post("/v1/auth/login") // request api login
      .set("Content-Type", "application/json")
      .send({ email: userCustomer.email, password: password }) // need email and password for login userCustomer
      .then((res) => {
        request(app)
          .get("/v1/auth/whoami") // request api whoami
          .set("authorization", "Bearer " + res.body.accessToken) // set authorization jwt
          .then((res) => {
            expect(res.statusCode).toBe(200); // check status respond
            expect(res.body.name).toEqual(userCustomer.name); // check name
            expect(res.body.email).toEqual(userCustomer.email.toLowerCase()); // check email
          })
          .catch((err) => {
            console.error(err.message); //error message;
          });
      });
  });
});
