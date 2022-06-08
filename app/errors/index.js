const CarAlreadyRentedError = require('./CarAlreadyRentedError');
const EmailNotRegisteredError = require('./EmailNotRegisteredError');
const InsufficientAccessError = require('./InsufficientAccessError');
const NotFoundError = require('./NotFoundError');
const WrongPasswordError = require('./WrongPasswordError');
const EmailAlreadyTakenError = require('./EmailAlreadyTakenError');

module.exports = {
  CarAlreadyRentedError,
  EmailNotRegisteredError,
  InsufficientAccessError,
  NotFoundError,
  WrongPasswordError,
  EmailAlreadyTakenError,
};
