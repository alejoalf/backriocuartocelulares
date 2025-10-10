const { Sequelize } = require('sequelize');
require('dotenv').config();

const connectionString = process.env.PG_CONNECTION_STRING || process.env.DATABASE_URL || null;

let sequelize;
if (connectionString) {
  try {
    // debug: imprimir host resuelto de la connection string (oculta parte sensible)
    let hostname = null;
    try {
      const url = new URL(connectionString);
      hostname = url.hostname;
      console.log('Using PG_CONNECTION_STRING host:', hostname);
    } catch (e) {
      console.log('Using PG_CONNECTION_STRING (could not parse hostname)');
    }

    // Decidir SSL:
    // - Si DB_SSL está definida: usarla (true/false)
    // - Si no está y el host contiene ".pooler.": asumimos que el pooler no usa SSL -> false
    // - En otro caso activar SSL (con rejectUnauthorized:false para compatibilidad)
    let sslConfig;
    if (typeof process.env.DB_SSL !== 'undefined') {
      sslConfig = process.env.DB_SSL === 'true'
        ? { require: true, rejectUnauthorized: false }
        : false;
    } else if (hostname && hostname.includes('.pooler.')) {
      sslConfig = false;
    } else {
      sslConfig = { require: true, rejectUnauthorized: false };
    }

    console.log('SSL mode for DB connection:', sslConfig === false ? 'disabled' : 'enabled');

    sequelize = new Sequelize(connectionString, {
      dialect: 'postgres',
      protocol: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: sslConfig
      }
    });
  } catch (err) {
    console.error('Error creando Sequelize con PG_CONNECTION_STRING:', err);
    throw err;
  }
} else {
  // Fallback tradicional (si aún lo necesitas)
  const sslEnv = (process.env.DB_SSL === 'true');
  sequelize = new Sequelize(
    process.env.DB_NAME || 'postgres',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: sslEnv ? { require: true, rejectUnauthorized: false } : false
      }
    }
  );
}

module.exports = sequelize;
