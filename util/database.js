const Sequelize = require('sequelize')

const sequelize = new Sequelize('node-complete', 'root', 'Vinay5@mysql', {
    dialect: 'mysql', 
    host: 'localhost'
});

module.exports = sequelize;  