const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

const connectionString = process.env.PG_CONNECTION_STRING || null;

let sequelize;
if (connectionString) {
  // Usar connection string de Supabase (recomendado)
  sequelize = new Sequelize(connectionString, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  // Fallback a variables individuales (compatibilidad con tu código actual)
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    }
  );
}

module.exports = sequelize;
