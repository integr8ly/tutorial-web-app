module.exports = (sequelize, DataTypes) => {
  const Repository = sequelize.define("Repository", {
    url: DataTypes.STRING,
  });

  return Repository;
};