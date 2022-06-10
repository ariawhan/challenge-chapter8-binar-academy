const ApplicationController = require("./ApplicationController");
const {
  EmailNotRegisteredError,
  InsufficientAccessError,
  RecordNotFoundError,
  WrongPasswordError,
  EmailAlreadyTakenError,
} = require("../errors");
const { JWT_SIGNATURE_KEY } = require("../../config/application");

class AuthenticationController extends ApplicationController {
  constructor({ userModel, roleModel, bcrypt, jwt }) {
    super();
    this.userModel = userModel;
    this.roleModel = roleModel;
    this.bcrypt = bcrypt;
    this.jwt = jwt;
  }

  accessControl = {
    PUBLIC: "PUBLIC",
    ADMIN: "ADMIN",
    CUSTOMER: "CUSTOMER",
  };

  authorize = (rolename) => (req, res, next) => {
    try {
      const token = req.headers.authorization?.split("Bearer ")[1];
      const payload = this.decodeToken(token);

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
      // console.log(req.body);
      const email = req.body.email.toLowerCase();
      const { password } = req.body;
      const user = await this.userModel.findOne({
        where: { email },
        include: [{ model: this.roleModel, attributes: ["id", "name"] }],
      });

      if (!user) {
        const err = new EmailNotRegisteredError(email);
        res.status(404).json(err);
        return;
      }
      // console.log(password);
      const isPasswordCorrect = await this.verifyPassword(
        password,
        user.encryptedPassword
      );

      // console.log(isPasswordCorrect);

      if (!isPasswordCorrect) {
        const err = new WrongPasswordError();
        res.status(401).json(err);
        return;
      }
      // console.log(user);
      const accessToken = this.createTokenFromUser(user, user.Role);
      // console.log(accessToken);
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
        encryptedPassword: this.encryptPassword(password),
        roleId: role.id,
      });

      const accessToken = this.createTokenFromUser(user, role);

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
      const err = new RecordNotFoundError(this.userModel.name);
      res.status(404).json(err);
      return;
    }

    const role = await this.roleModel.findByPk(user.roleId);

    if (!role) {
      const err = new RecordNotFoundError(this.roleModel.name);
      res.status(404).json(err);
      return;
    }

    res.status(200).json(user);
  };

  createTokenFromUser = (user, role) =>
    this.jwt.sign(
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
      JWT_SIGNATURE_KEY
    );

  decodeToken(token) {
    return this.jwt.verify(token, JWT_SIGNATURE_KEY);
  }

  encryptPassword = (password) => this.bcrypt.hashSync(password, 10);

  verifyPassword = async (password, encryptedPassword) => {
    // console.log(password, encryptedPassword);
    return await this.bcrypt.compareSync(password, encryptedPassword);
  };
}

module.exports = AuthenticationController;
