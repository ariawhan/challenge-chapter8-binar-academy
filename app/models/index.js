const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

// Create conditions
let env = 'development';
if (process.env.NODE_ENV) {
  env = process.env.NODE_ENV;
}
//

const basename = path.basename(__filename);
const config = require(`${__dirname}/../../config/database.js`)[env];
const db = {};

// Update Sequelize Config
let squalizeConfig = (process.env[config.use_env_variable], config);
if (!config.use_env_variable) {
  squalizeConfig = (config.database, config.username, config.password, config);
}
const sequelize = new Sequelize(squalizeConfig);
//

fs.readdirSync(__dirname)
  .filter(
    (file) => file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js',
  )
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes,
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
