'use strict';
module.exports = (sequelize, DataTypes) => {
  const Exchange = sequelize.define('Exchange', {
    exchangeName: DataTypes.STRING,
    exchangeId: DataTypes.STRING,
    params: DataTypes.BLOB
  }, {});
  Exchange.associate = function(models) {
    // associations can be defined here
  };
  return Exchange;
};