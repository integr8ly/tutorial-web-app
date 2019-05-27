const { Sequelize } = require('sequelize');
const { join } = require('path');

exports.createDatabase = (dbPath, dbName) => {
  return new Sequelize(`${dbName}`, null, null, {
    storage: join(__dirname, dbPath, `${dbName}.db`),
    dialect: 'sqlite',
    logging: true
  });
};