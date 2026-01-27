const { Sequelize } = require('sequelize');

const sequelize = process.env.NODE_ENV === 'test'
  ? new Sequelize('sqlite::memory:', { logging: false })
  : new Sequelize(process.env.DATABASE_URL || 'sqlite:./database.sqlite', {
      dialect: 'sqlite',
      logging: false, // Set to console.log to see SQL queries
    });

module.exports = sequelize;