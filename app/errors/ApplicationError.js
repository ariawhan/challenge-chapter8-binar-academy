class ApplicationError extends Error {
  // get details() {
  //   return this.details;
  // }

  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        details: this.details,
      },
    };
  }
}

module.exports = ApplicationError;
