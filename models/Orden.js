const { DataTypes } = require('sequelize');
const sequelize = require('../db.js');

const Orden = sequelize.define('Orden', {
  nombre: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  telefono: { type: DataTypes.STRING, allowNull: false },
  direccion: { type: DataTypes.STRING, allowNull: false },
  total: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  items: { type: DataTypes.JSON, allowNull: false }, // array de productos
  estado: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pendiente' },
}, {
  tableName: 'Ordenes'
});

module.exports = Orden; 