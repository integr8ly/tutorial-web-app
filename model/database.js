const { Sequelize } = require('sequelize');
const { join } = require('path');

exports.createDatabase = (databaseName, databasePath) => {
  const databaseFile = `${join(databasePath, databaseName)}.db`;
  console.log(`user database is ${databaseFile}`);

  return new Sequelize(`${databaseName}`, null, null, {
    storage: databaseFile,
    dialect: 'sqlite',
    logging: false
  });
};