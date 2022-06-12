const request = require('supertest');
const app = require('../../../app');

// import model user for create and delete account
const { User } = require('../../../app/models');

// describe model test
describe('POST /v1/auth/register', () => {
  // account for test 201 register suksess
  const user201 = {
    name: 'user201',
    email: 'user201@gmail.com',
    password: 'ariawhan',
  };

  // account for test 422 Email Already Taken
  const user422 = {
    name: 'user422',
    email: 'user422@gmail.com',
    password: 'ariawhan',
    roleId: 2,
  };
  // account for test 500 Email Invalid
  const user500 = {
    name: 'user500',
    email: 'user500gmail.com',
    password: 'ariawhan',
    roleId: 2,
  };
  // before each create account to test Email Already Taken
  beforeEach(async () => {
    // Create account with model user
    await User.create(user422);
  });
  // after test done delete account registered suksess and email already taken
  afterEach(async () => {
    // delete account account suksess login with model user
    await User.destroy({
      where: {
        email: user201.email,
      },
    });
    // delete account account email already taken with model
    await User.destroy({
      where: {
        email: user422.email,
      },
    });
  });
  // create test to register account suksess with status code 201
  it('should response with 201 as status code (Success Register)', async () => await request(app)
    .post('/v1/auth/register') // Api register
    .set('Content-Type', 'application/json') // set header with type body json
    .send(user201) // send bosy with acc user 201
    .then((res) => {
      expect(res.statusCode).toBe(201); // check status respond
      expect(res.body).toEqual(
        expect.objectContaining({
          accessToken: expect.any(String), // check access token with string
        }),
      );
    }));
  // create test to register account with status code 422 email already taken
  it('should response with 422 as status code (Email Already Taken)', async () => await request(app)
    .post('/v1/auth/register') // Api register
    .set('Content-Type', 'application/json') // set header with type body json
    .send(user422) // send bosy with acc user 201
    .then((res) => {
      expect(res.statusCode).toBe(422); // check status respond
      expect(res.body.error.details.email.toLowerCase()).toEqual(
        user422.email.toLowerCase(), // check email taken with email user422
      );
    }));
  it('should response with 500 as status code (Email Format Invalid))', async () => await request(app)
    .post('/v1/auth/register') // Api register
    .set('Content-Type', 'application/json') // set header with type body json
    .send(user500) // send bosy with acc user 201
    .then((res) => {
      expect(res.statusCode).toBe(500); // check toBe 404 status response not found
      expect(res.body.error.message).toEqual('Invalid email Format!'); // check error message
    }));
});
