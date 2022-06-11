const request = require("supertest");
const app = require("../../../app");

//import model user squalize
const { User } = require("../../../app/models");

// import bcryptjs for generating password
const bcrypt = require("bcryptjs");

describe("POST /v1/auth/login", () => {
  // test data
  const emailForLogin = "userlogin200@test.com"; // for testing login
  const emailNotRegistered = "emailNotRegistered@test.com"; // for testing Email Not Register
  const password = "safiratyas";
  const passwordInCorrect = "PasswordNotCorrect";
  const passwordBcrypt = bcrypt.hashSync(password, 10);

  // data for create and login (sukses login)
  const user200 = {
    name: "userlogin200",
    email: emailForLogin,
    encryptedPassword: passwordBcrypt,
    roleId: 2,
  };

  // before login create account for test login with before each (berjalan setelah it dibawah belum di jalankan "BEFORE")
  beforeEach(async () => {
    // Before login create account data before Login
    await User.create(user200);
    // Before test EMail Not Registered check email in database
    const user = await User.findOne({ where: { email: emailNotRegistered } });
    // check user email
    if (user != null) {
      // if user not null destory the user account
      await User.destroy({
        where: {
          email: emailNotRegistered, // destroy with where email == email user email not registered
        },
      });
    }
  });

  //After Login sukses => delete account test with after each (berjalan setelah it di bawah selesai di jalankan "AFTER")
  afterEach(async () => {
    // just destroy the account test with squalize
    await User.destroy({
      where: {
        email: emailForLogin, // destroy with where email == email user for destroy
      },
    });
  });

  // If data sukses create, now create test jest login
  it("should response with 200 as status code (Suksess login)", async () => {
    return request(app)
      .post("/v1/auth/login") // method post and url rounter login
      .set("Content-Type", "application/json") // set headers with content type json
      .send({ email: user200.email, password: password }) // just need email and password
      .then((res) => {
        expect(res.statusCode).toBe(200); // check toBe 200 status response sukses
        expect(res.body).toEqual(
          expect.objectContaining({
            accessToken: expect.any(String), // check access token with string
          })
        );
      });
  });
  it("should response with 401 as status code (passwrod Incorrect)", async () => {
    return request(app)
      .post("/v1/auth/login") // method post and url rounter login
      .set("Content-Type", "application/json") // set headers with content type json
      .send({ email: user200.email, password: passwordInCorrect }) // just need email and password incorect
      .then((res) => {
        expect(res.statusCode).toBe(401); // check toBe 401 status response password incorect
        expect(res.body.error.details.message).toEqual(
          "Please input correct password!"
        ); // check equal email faild or not registered
      });
  });
  it("should response with 404 as status code (Email Not Registered)", async () => {
    return request(app)
      .post("/v1/auth/login") // method post and url rounter login
      .set("Content-Type", "application/json") // set headers with content type json
      .send({ email: emailNotRegistered, password: password }) // just need email not registered and random password
      .then((res) => {
        expect(res.statusCode).toBe(404); // check toBe 404 status response not found
        expect(res.body.error.details.email).toEqual(
          emailNotRegistered.toLowerCase() // cehck email no registered with email not registered
        );
      });
  });
});
