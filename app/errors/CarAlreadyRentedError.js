const ApplicationError = require('./ApplicationError');

class CarAlreadyRentedError extends ApplicationError {
  constructor(car) {
    super('Car is already rented!!');
    this.car = car;
  }

  get details() {
    return { message: `Car name ${this.car.name} is already rented` };
  }
}

module.exports = CarAlreadyRentedError;
