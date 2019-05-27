const { Sequelize } = require("sequelize");
const { createDatabase } = require("./database");
const RepositoryModel = require("./repository");
const { URL } = require('url');

const databaseLocation =
  process.env.DATABASE_LOCATION ||
  (process.env.NODE_ENV === 'production'
    ? '/opt/user-walkthroughs'
    : '..');

const databaseName = "webapp";

const database = createDatabase(databaseLocation, databaseName);
const repository = RepositoryModel(database, Sequelize);

/**
 * Syncs the models with the database to create all tables
 * and associations
 */
const sync = () => database.sync({ force: false });

const newRepository = url => {
  return new Promise((resolve, reject) => {
    try {
      const parsed = new URL(url);
      return repository.create({ url: parsed.toString() }).then(resolve).catch(reject);
    } catch (err) {
      console.error(`invalid repository: ${url}`);
      return reject(err);
    }
  });
};

module.exports = {
  newRepository,
  repository,
  database,
  sync
};