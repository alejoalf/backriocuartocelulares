const { DataTypes } = require('sequelize');
const sequelize = require('../db.js');

const Producto = sequelize.define('Producto', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
  },
  precio: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false,
  },
  imagen: {
    type: DataTypes.STRING,
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  categoria: {
    type: DataTypes.STRING,
  },
  subcategoria: {
    type: DataTypes.STRING,
  },
});

module.exports = Producto;
