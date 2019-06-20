module.exports = (sequelize, DataTypes) => {
  const Settings = sequelize.define('Settings', {
    key: DataTypes.STRING,
    value: DataTypes.STRING
  });

  return Settings;
};
