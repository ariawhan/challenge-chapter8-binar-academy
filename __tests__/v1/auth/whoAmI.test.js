// request with supertest
const request = require('supertest');
// bcrypt for hash password
const bcrypt = require('bcryptjs');
// app for testing
const app = require('../../../app');
// user model for authentication
const { User } = require('../../../app/models');
// import contorller auth
const { AuthenticationController } = require('../../../app/controllers');

// password admin and customer
const password = 'Hati-hati-dijalan';
// data admin for authentication to get token admin
const userAdmin = {
  name: 'Admin Test',
  email: 'admin@mail.com',
  // hash of password
  encryptedPassword: bcrypt.hashSync(password, 10),
  // admin role 2
  roleId: 2,
};
// data customer for authentication to get token customer
const userCustomer = {
  name: 'Customer Test',
  email: 'customer@mail.com',
  // hash of password
  encryptedPassword: bcrypt.hashSync(password, 10),
  // customer role 1
  roleId: 1,
};

describe('GET /v1/auth/whoami', () => {
  beforeAll(async () => {
    try {
      // create user admin before test
      await User.create(userAdmin);
      // create user customer before test
      await User.create(userCustomer);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err.message);
    }
  });

  afterAll(async () => {
    // delete account after test
    try {
      // delete account admin
      await User.destroy({
        where: {
          // delete where with email
          email: userAdmin.email,
        },
      });
      await User.destroy({
        where: {
          // delete where with email
          email: userCustomer.email,
        },
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err.message);
    }
  });

  // check test if should response with 401 status code
  describe('GET should response with 401 as status code', () => {
    let tokenWhoAmIAdmin;
    // login before test
    beforeEach(async () => {
      await request(app)
        .post('/v1/auth/login') // request api login
        .set('Content-Type', 'application/json') // set headers
        .send({ email: userAdmin.email, password }) // need email and password for login userAdmin
        .then((AdminWhoAmILogin) => {
          tokenWhoAmIAdmin = AdminWhoAmILogin.body.accessToken;
        });
    });
    it('Admin cannot be get who Am I', async () => await request(app)
      .get('/v1/auth/whoami') // request api whoami
      .set('authorization', `Bearer ${tokenWhoAmIAdmin}`) // set authorization jwt
      .then((adminResWhoAmI) => {
        expect(adminResWhoAmI.statusCode).toBe(401); // check status respond
        expect(adminResWhoAmI.body).toEqual({
          error: {
            name: 'Error',
            message: 'Access forbidden!',
            details: {
              role: 'ADMIN',
              reason: 'ADMIN is not allowed to perform this operation.',
            },
          },
        });
      }));
  });
  describe('GET should respond with 200 as status code', () => {
    let tokenWhoAmICustomer;
    // login before test
    beforeEach(async () => {
      await request(app)
        .post('/v1/auth/login') // request api login
        .set('Content-Type', 'application/json') // set headers
        // need email and password for login userCustomer
        .send({ email: userCustomer.email, password })
        .then((CustomerWhoAmILogin) => {
          tokenWhoAmICustomer = CustomerWhoAmILogin.body.accessToken; // token JWT
        });
    });
    it('Customer access to GET Who Am I', async () => await request(app)
      .get('/v1/auth/whoami') // request api whoami
      .set('authorization', `Bearer ${tokenWhoAmICustomer}`) // set authorization jwt
      .then((customerResWhoAmI) => {
        expect(customerResWhoAmI.statusCode).toBe(200); // check status respond
        expect(customerResWhoAmI.body.name).toEqual(userCustomer.name); // check name
        expect(customerResWhoAmI.body.email).toEqual(
          userCustomer.email.toLowerCase(),
        ); // check email
      }));
  });
});

// check user not found and role not found
describe('#handleGetUser', () => {
  // data user not found
  const userNotFound = {
    user: {
      id: 1000,
      name: 'User Not Found Test',
      email: 'usernotFound@mail.com',
      role: { id: 1, name: 'CUSTOMER' },
    },
  };
  beforeEach(async () => {
    // before test delete user id not found
    try {
      const checkUserNotFound = await User.findByPk(userNotFound.id);
      if (checkUserNotFound) {
        await User.destroy({
          where: {
            // delete where with id
            id: userNotFound.id,
          },
        });
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  });
  // get test status code 404 error
  describe('GET should response with 404 as status code', () => {
    // id users after create users
    const UserRoleNotFound = {
      id: 3000,
      roleId: 10,
    };
    // create user Role Not Found Test
    it('User not found', async () => {
      // create model
      const mockAuthModel = {};
      mockAuthModel.findByPk = jest.fn();
      // create respond
      const mockResponse = {};
      mockResponse.status = jest.fn().mockReturnThis();
      mockResponse.json = jest.fn().mockReturnThis();
      // declaration class auth controller with constructor uderModel
      const authController = new AuthenticationController({
        userModel: mockAuthModel,
      });
      // execution with request and response
      await authController.handleGetUser(userNotFound, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.anything());
    });
    it('Role not found', async () => {
      // create model
      const mockTask = new User(UserRoleNotFound);
      const mockAuthModel = {};
      mockAuthModel.findByPk = jest.fn().mockReturnValue(mockTask);
      const mockAuthModelRole = {};
      mockAuthModelRole.findByPk = jest.fn();
      // create respond
      const mockResponse = {};
      mockResponse.status = jest.fn().mockReturnThis();
      mockResponse.json = jest.fn().mockReturnThis();
      // declaration class auth controller with constructor uderModel
      const authController = new AuthenticationController({
        roleModel: mockAuthModelRole,
        userModel: mockAuthModel,
      });
      // execution with request and response
      await authController.handleGetUser(
        { user: { id: UserRoleNotFound.id } },
        mockResponse,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.anything());
    });
  });
});
