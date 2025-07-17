const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
const sequelize = require('./db');

(async () => {
  await sequelize.sync();
  const hash = await bcrypt.hash('admin1234', 10); // Cambia la contraseña por una segura
  await Admin.create({ username: 'admin', password: hash });
  console.log('Admin creado');
  process.exit();
})();
