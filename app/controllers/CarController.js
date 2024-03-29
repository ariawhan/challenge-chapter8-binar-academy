const { Op } = require('sequelize');
const ApplicationController = require('./ApplicationController');
const { CarAlreadyRentedError, CarNotFound } = require('../errors');

class CarController extends ApplicationController {
  constructor({ carModel, userCarModel, dayjs }) {
    super();
    this.carModel = carModel;
    this.userCarModel = userCarModel;
    this.dayjs = dayjs;
  }

  handleListCars = async (req, res) => {
    const offset = this.getOffsetFromRequest(req);
    const limit = req.query.pageSize;
    // console.log(req.query);
    const query = await this.getListQueryFromRequest(req);
    const cars = await this.carModel.findAll(query);
    const carCount = await this.carModel.count({
      where: query.where,
      include: query.include,
    });
    const pagination = await this.buildPaginationObject(req, carCount);

    res.status(200).json({
      cars,
      meta: {
        pagination,
      },
    });
  };

  handleGetCar = async (req, res) => {
    const car = await this.getCarFromRequest(req.params.id);

    res.status(200).json(car);
  };

  handleCreateCar = async (req, res) => {
    try {
      const {
        name, price, size, image,
      } = req.body;
      // update handleCreateCar
      if (typeof price !== 'number') {
        throw new Error('Price must be number!');
      }
      //
      const car = await this.carModel.create({
        name,
        price,
        size,
        image,
        isCurrentlyRented: false,
      });

      res.status(201).json(car);
    } catch (err) {
      res.status(422).json({
        error: {
          name: err.name,
          message: err.message,
        },
      });
    }
  };

  handleRentCar = async (req, res, next) => {
    try {
      const { rentStartedAt } = req.body;
      const { rentEndedAt } = req.body;
      const car = await this.getCarFromRequest(req.params.id);

      // Update Rent Controllers
      if (typeof rentStartedAt !== 'string') {
        throw new Error('RentStartedAt must be date!');
      }
      if (!car) {
        const err = new CarNotFound(req.params.id);
        res.status(404).json(err);
        return;
      }
      let rentEnded = this.dayjs(rentStartedAt).add(1, 'day');

      if (rentEndedAt) {
        rentEnded = rentEnded;
      }
      //--

      const activeRent = await this.userCarModel.findOne({
        where: {
          carId: car.id,
          rentStartedAt: {
            [Op.gte]: rentStartedAt,
          },
          rentEndedAt: {
            [Op.lte]: rentEndedAt,
          },
        },
      });

      if (activeRent) {
        const err = new CarAlreadyRentedError(car);
        res.status(422).json(err);
        return;
      }

      const userCar = await this.userCarModel.create({
        userId: req.user.id,
        carId: car.id,
        rentStartedAt,
        rentEndedAt,
      });

      await this.carModel.update(
        {
          isCurrentlyRented: true,
        },
        {
          where: {
            id: req.params.id,
          },
        },
      );

      res.status(201).json(userCar);
    } catch (err) {
      next(err);
    }
  };

  handleUpdateCar = async (req, res) => {
    try {
      const {
        name, price, size, image,
      } = req.body;
      // update handleCreateCar
      if (typeof price !== 'number') {
        throw new Error('Price must be number!');
      }
      //
      const car = await this.getCarFromRequest(req.params.id);
      const newCar = await this.carModel.update(
        {
          name,
          price,
          size,
          image,
          isCurrentlyRented: false,
        },
        {
          where: {
            id: car.id,
          },
        },
      );

      res.status(201).json({
        message: `succesfully updated id ${car.id}`,
        data: await this.getCarFromRequest(req.params.id),
      });
    } catch (err) {
      res.status(422).json({
        error: {
          name: err.name,
          message: err.message,
        },
      });
    }
  };

  handleDeleteCar = async (req, res) => {
    const car = await this.carModel.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({
      message: `Succesfully delete car id ${req.params.id}`,
    });
  };

  async getCarFromRequest(req) {
    const response = await this.carModel.findByPk(req);
    return response;
  }

  getListQueryFromRequest(req) {
    const { size, availableAt } = req.query;
    const offset = this.getOffsetFromRequest(req);
    let limit = 10;
    if (req.query.pageSize) {
      limit = req.query.pageSize;
    }
    const where = {};
    const include = {
      model: this.userCarModel,
      as: 'userCar',
      required: false,
    };

    // update getListQueryFromRequest
    if (size) {
      where.size = size;
    }

    if (availableAt) {
      include.where = {
        rentEndedAt: {
          [Op.gte]: availableAt,
        },
      };
    }

    const query = {
      include,
      where,
      limit,
      offset,
    };

    return query;
  }
}

module.exports = CarController;
