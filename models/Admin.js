const { DataTypes } = require('sequelize');
const sequelize = require('../db.js');

const Admin = sequelize.define('Admin', {
  username: { type: DataTypes.STRING, unique: true },
  password: DataTypes.STRING, // Hasheada con bcrypt
});

module.exports = Admin;
