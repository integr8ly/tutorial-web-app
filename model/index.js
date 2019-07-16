const { Sequelize } = require('sequelize');
const { createDatabase } = require('./database');
const SettingsModel = require('./settings');
const { join } = require('path');
const { URL } = require('url');

const databasePath =
  process.env.DATABASE_LOCATION ||
  (process.env.NODE_ENV === 'production' ? '/opt/user-walkthroughs' : join(__dirname, '..'));

const databaseName = 'webapp';

const database = createDatabase(databaseName, databasePath);
const settings = SettingsModel(database, Sequelize);

const USER_WT_SETTINGS_KEY = 'walkthroughs.user';

/**
 * Syncs the models with the database to create all tables
 * and associations
 */
const sync = () => database.sync({ force: false });
const closeConnection = () => database.close();

const validUrl = url => {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
};

// Add or update a generic setting value
const setValue = (key, value) => {
  return new Promise((resolve, reject) => {
    settings
      .findOrCreate({
        where: { key },
        defaults: { key, value }
      })
      .then(([setting, created]) => {
        if (created) {
          console.log(`New setting ${key} added`);
          return resolve(setting);
        }

        setting
          .update({ value })
          .then(resolve)
          .catch(reject);
      })
      .catch(reject);
  });
};

// Return the value of the user walkthroughs
const getUserWalkthroughs = () => {
  return settings.findOne({
    where: { key: USER_WT_SETTINGS_KEY }
  });
};

// Set the value of the user walkthroughs to `data` where `data` is a list of urls
// separated by a newline
const setUserWalkthroughs = data => {
  return new Promise((resolve, reject) => {
    let newValue = '';
    if (data && data !== '') {
      const lines = data.trim().split('\n');
      lines.forEach(line => {
        if (!validUrl(line)) {
          return reject(new Error(`${line} is not a valid URL`));
        }
      });
      newValue = lines.join('\n');
    }
    return setValue(USER_WT_SETTINGS_KEY, newValue)
      .then(resolve)
      .catch(reject);
  });
};

module.exports = {
  setUserWalkthroughs,
  getUserWalkthroughs,
  closeConnection,
  validUrl,
  database,
  sync
};
