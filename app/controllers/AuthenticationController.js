const ApplicationController = require('./ApplicationController');
const {
  EmailNotRegisteredError,
  InsufficientAccessError,
  RecordNotFoundError,
  WrongPasswordError,
  EmailAlreadyTakenError,
} = require('../errors');
const { JWT_SIGNATURE_KEY } = require('../../config/application');

class AuthenticationController extends ApplicationController {
  constructor({
    userModel, roleModel, bcrypt, jwt,
  }) {
    super();
    this.userModel = userModel;
    this.roleModel = roleModel;
    this.bcrypt = bcrypt;
    this.jwt = jwt;
  }

  accessControl = {
    PUBLIC: 'PUBLIC',
    ADMIN: 'ADMIN',
    CUSTOMER: 'CUSTOMER',
  };

  authorize = (rolename) => async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split('Bearer ')[1];
      const payload = await this.decodeToken(token);
      if (!!rolename && rolename !== payload.role.name) {
        throw new InsufficientAccessError(payload?.role?.name);
      }

      req.user = payload;
      next();
    } catch (err) {
      let catchErr = null;
      if (err.details) {
        catchErr = err.details;
      }
      res.status(401).json({
        error: {
          name: err.name,
          message: err.message,
          details: catchErr,
        },
      });
    }
  };

  handleLogin = async (req, res, next) => {
    try {
      const email = req.body.email.toLowerCase();
      // Update handleLogin valid email
      const emailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!email.match(emailformat)) {
        throw new Error('Invalid email Format!');
      }
      const { password } = req.body;
      const user = await this.userModel.findOne({
        where: { email },
        include: [{ model: this.roleModel, attributes: ['id', 'name'] }],
      });

      if (!user) {
        const err = new EmailNotRegisteredError(email);
        res.status(404).json(err);
        return;
      }
      const isPasswordCorrect = await this.verifyPassword(
        password,
        user.encryptedPassword,
      );

      if (!isPasswordCorrect) {
        const err = new WrongPasswordError();
        res.status(401).json(err);
        return;
      }
      const accessToken = await this.createTokenFromUser(user, user.Role);
      res.status(200).json({
        accessToken,
      });
    } catch (err) {
      next(err);
    }
  };

  handleRegister = async (req, res, next) => {
    try {
      // console.log(req.body.name, req.body.email, req.body.password);
      const { name } = req.body;
      const email = req.body.email.toLowerCase();
      // Update handleLogin valid email
      const emailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!email.match(emailformat)) {
        throw new Error('Invalid email Format!');
      }
      const { password } = req.body;
      const existingUser = await this.userModel.findOne({ where: { email } });

      if (existingUser) {
        const err = new EmailAlreadyTakenError(email);
        res.status(422).json(err);
        return;
      }

      const role = await this.roleModel.findOne({
        where: { name: this.accessControl.CUSTOMER },
      });

      const user = await this.userModel.create({
        name,
        email,
        encryptedPassword: await this.encryptPassword(password),
        roleId: role.id,
      });

      const accessToken = await this.createTokenFromUser(user, role);

      res.status(201).json({
        accessToken,
      });
    } catch (err) {
      next(err);
    }
  };

  handleGetUser = async (req, res) => {
    const user = await this.userModel.findByPk(req.user.id);
    if (!user) {
      const err = new RecordNotFoundError(req.user.name);
      res.status(404).json(err);
      return;
    }

    const role = await this.roleModel.findByPk(user.roleId);
    if (!role) {
      const err = new RecordNotFoundError(user.roleId);
      res.status(404).json(err);
      return;
    }

    res.status(200).json(user);
  };

  createTokenFromUser = async (user, role) => await this.jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: {
        id: role.id,
        name: role.name,
      },
    },
    process.env.JWT_SIGNATURE_KEY,
  );

  decodeToken = async (token) => await this.jwt.verify(token, process.env.JWT_SIGNATURE_KEY);

  encryptPassword = async (password) => await this.bcrypt.hashSync(password, 10);

  verifyPassword = async (password, encryptedPassword) => {
    await this.bcrypt.compareSync(password, encryptedPassword);
  };
}

module.exports = AuthenticationController;
