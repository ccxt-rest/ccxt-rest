'use strict';
module.exports = (sequelize, DataTypes) => {
  const JwtData = sequelize.define('JwtData', {
    secret: DataTypes.STRING
  }, {});
  JwtData.associate = function(models) {
    // associations can be defined here
  };
  return JwtData;
};