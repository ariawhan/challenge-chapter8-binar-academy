const { NotFoundError } = require("../errors");

class ApplicationController {
  handleGetRoot = (req, res) => {
    res.status(200).json({
      status: "OK",
      message: "BCR API is up and running!",
    });
  };

  handleNotFound = (req, res) => {
    const err = new NotFoundError(req.method, req.url);
    res.status(404).json({
      error: {
        name: err.name,
        message: err.message,
        details: err.details,
      },
    });
  };
  // Update Adding next
  handleError = (err, req, res, next) => {
    // update details
    let details = err.details;
    if (!err.details) {
      details = null;
    }
    res.status(500).json({
      error: {
        name: err.name,
        message: err.message,
        details: details,
      },
    });
  };

  getOffsetFromRequest = (req) => {
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;
    return offset;
  };

  buildPaginationObject = (req, count) => {
    const { page = 1, pageSize = 10 } = req.query;
    const pageCount = Math.ceil(count / pageSize);
    return {
      page,
      pageCount,
      pageSize,
      count,
    };
  };
}

module.exports = ApplicationController;
