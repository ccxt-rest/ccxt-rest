'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const Umzug = require('umzug');
const basename = path.basename(__filename);
const ccxtConfig = require('../config')
const env = ccxtConfig.env || 'production';
const dbConfig = ccxtConfig.dbConfigPath ? require(ccxtConfig.dbConfigPath) : require(`${__dirname}/../config/database/${env}.js`);
const db = {};

if (dbConfig.dialect && dbConfig.dialect.toLowerCase() == 'sqlite' 
    && (dbConfig.storage && !dbConfig.storage.toLowerCase().includes('memory'))) {
      fs.mkdirSync(path.dirname(path.resolve(dbConfig.storage)), {recursive:true});
}

let sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);

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
  const sequelize = new Sequelize(dbConfig);
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
