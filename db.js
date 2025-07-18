const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT, // ¡Excelente que agregaste DB_PORT!
    dialect: 'postgres',
    logging: false, // o una función, o false para evitar el warning

    // **** ¡AGREGA ESTO! ****
    dialectOptions: {
      ssl: {
        require: true,           // Forzar el uso de SSL
        rejectUnauthorized: false // Ignorar la validación del certificado (necesario en Render)
      }
    }
    // **********************
  }
);

module.exports = sequelize;
