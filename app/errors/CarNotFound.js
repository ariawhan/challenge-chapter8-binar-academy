const ApplicationError = require('./ApplicationError');

class CarNotFound extends ApplicationError {
  constructor(carId) {
    super('Not found car!');
    this.carId = carId;
  }

  get details() {
    return { message: `Not found car id ${this.carId}` };
  }
}

module.exports = CarNotFound;
