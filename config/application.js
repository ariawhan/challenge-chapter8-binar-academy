// Create conditions
let JWT = 'Rahasia';
if (process.env.JWT_SIGNATURE_KEY) {
  JWT = process.env.JWT_SIGNATURE_KEY;
}
//

module.exports = {
  MORGAN_FORMAT:
    ':method :url :status :res[content-length] - :response-time ms',
  JWT_SIGNATURE_KEY: JWT,
};
