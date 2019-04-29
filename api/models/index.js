'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const Umzug = require('umzug');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'production';
const config = require(__dirname + '/../config/database.js')[env];
const db = {};

if (config.dialect && config.dialect.toLowerCase() == 'sqlite' 
    && (config.storage && !config.storage.toLowerCase().includes('memory'))) {
      fs.mkdirSync(path.dirname(path.resolve(config.storage)), {recursive:true});
}

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.migrate = function() {
  const sequelize = new Sequelize(config);
  const umzug     = new Umzug({
    storage: "sequelize",
  
    storageOptions: {
      sequelize: sequelize
    },
  
    migrations: {
      params: [
        sequelize.getQueryInterface(),
        Sequelize
      ],
      path: path.join(__dirname, "../migrations")
    }
  });
  
  return umzug.up();
}

module.exports = db;
