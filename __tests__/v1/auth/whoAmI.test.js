// request with supertest
const request = require("supertest");
// bcrypt for hash password
const bcrypt = require("bcryptjs");
// app for testing
const app = require("../../../app");
// user model for authentication
const { User } = require("../../../app/models");

// password admin and customer
const password = "Hati-hati-dijalan";
// data admin for authentication to get token admin
const userAdmin = {
  name: "Admin Test",
  email: "admin@mail.test",
  // hash of password
  encryptedPassword: bcrypt.hashSync(password, 10),
  // admin role 2
  roleId: 2,
};
// data customer for authentication to get token customer
const userCustomer = {
  name: "Customer Test",
  email: "customer@mail.test",
  // hash of password
  encryptedPassword: bcrypt.hashSync(password, 10),
  // customer role 1
  roleId: 1,
};

describe("GET /v1/auth/whoami", () => {
  beforeAll(async () => {
    try {
      // create user admin before test
      await User.create(userAdmin);
      // create user customer before test
      await User.create(userCustomer);
    } catch (err) {
      // error message if have error
      console.error(err.message);
    }
  });

  afterAll(async () => {
    // delete account after test
    try {
      // delete account admin
      await User.destroy({
        where: {
          //delete where with email
          email: userAdmin.email,
        },
      });
      await User.destroy({
        where: {
          //delete where with email
          email: userCustomer.email,
        },
      });
    } catch (err) {
      // error message if have error
      console.error(err.message);
    }
  });

  // check test if should response with 401 status code
  describe("GET should response with 401 as status code", () => {
    let tokenWhoAmIAdmin;
    // login before test
    beforeEach(async () => {
      await request(app)
        .post("/v1/auth/login") // request api login
        .set("Content-Type", "application/json") // set headers
        .send({ email: userAdmin.email, password: password }) // need email and password for login userAdmin
        .then((AdminWhoAmILogin) => {
          tokenWhoAmIAdmin = AdminWhoAmILogin.body.accessToken;
        });
    });
    it("Admin cannot be get who Am I", async () => {
      return await request(app)
        .get("/v1/auth/whoami") // request api whoami
        .set("authorization", "Bearer " + tokenWhoAmIAdmin) // set authorization jwt
        .then((adminResWhoAmI) => {
          expect(adminResWhoAmI.statusCode).toBe(401); // check status respond
          expect(adminResWhoAmI.body).toEqual({
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
  describe("GET should respond with 200 as status code", () => {
    let tokenWhoAmICustomer;
    // login before test
    beforeEach(async () => {
      await request(app)
        .post("/v1/auth/login") // request api login
        .set("Content-Type", "application/json") // set headers
        .send({ email: userCustomer.email, password: password }) // need email and password for login userCustomer
        .then((CustomerWhoAmILogin) => {
          tokenWhoAmICustomer = CustomerWhoAmILogin.body.accessToken; // token JWT
        });
    });
    it("Customer access to GET Who Am I", async () => {
      return await request(app)
        .get("/v1/auth/whoami") // request api whoami
        .set("authorization", "Bearer " + tokenWhoAmICustomer) // set authorization jwt
        .then((customerResWhoAmI) => {
          expect(customerResWhoAmI.statusCode).toBe(200); // check status respond
          expect(customerResWhoAmI.body.name).toEqual(userCustomer.name); // check name
          expect(customerResWhoAmI.body.email).toEqual(
            userCustomer.email.toLowerCase()
          ); // check email
        });
    });
  });
});
