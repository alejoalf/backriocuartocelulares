// --- insert: forzar IPv4 AL PRINCIPIO (antes de cargar módulos que hacen DNS)
const dns = require('dns');
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

const { MercadoPagoConfig, Preference } = require('mercadopago');
const dotenv = require('dotenv');
dotenv.config();

const mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
const preference = new Preference(mpClient);

const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const sequelize = require('./db.js');
const Producto = require('./models/Producto.js');
const Admin = require('./models/Admin.js');
const Orden = require('./models/Orden.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = express();
const server = createServer(app);

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configurar Socket.io con CORS
const io = new Server(server, {
  cors: {
    origin: "https://frontriocuartocelulares.vercel.app", // URL del frontend
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Configurar multer para subidas de archivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Solo permitir imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

const JWT_SECRET = process.env.JWT_SECRET || 'supersecreto';

// Middleware de autenticación
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  try {
    const token = auth.split(' ')[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
}

// Sincroniza la base de datos
sequelize.sync().then(() => console.log('Base de datos sincronizada'));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Función para emitir actualización de stock
function emitStockUpdate(productoId, nuevoStock) {
  io.emit('stock-updated', {
    productoId,
    stock: nuevoStock
  });
}

// Endpoint para subir imágenes
app.post('/api/upload', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    // Convertir el buffer a base64
    const base64Image = req.file.buffer.toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${base64Image}`;

    // Subir a Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'riocuartocelulares',
      resource_type: 'auto',
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' }
      ]
    });

    res.json({ 
      url: result.secure_url,
      public_id: result.public_id 
    });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({ error: 'Error al subir la imagen' });
  }
});

// Login admin
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ where: { username } });
  if (!admin) return res.status(401).json({ error: 'Credenciales inválidas' });
  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });
  const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '2h' });
  res.json({ token });
});

// Endpoints CRUD de productos
app.get('/api/productos', async (req, res) => {
  const productos = await Producto.findAll();
  res.json(productos);
});

// Solo admins pueden agregar productos
app.post('/api/productos', authMiddleware, async (req, res) => {
  console.log("BODY RECIBIDO:", req.body);
  const {
    nombre,
    descripcion,
    precio,
    imagen,
    stock,
    categoria,
    subcategoria
  } = req.body;

  if (!nombre || !precio || !categoria || !subcategoria) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const prod = await Producto.create({
    nombre,
    descripcion,
    precio,
    imagen,
    stock,
    categoria,
    subcategoria
  });

  // Emitir actualización de stock para el nuevo producto
  emitStockUpdate(prod.id, prod.stock);

  res.json(prod);
});

app.put('/api/productos/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const producto = await Producto.findByPk(id);
  if (producto) {
    await Producto.update(req.body, { where: { id } });
    // Emitir actualización si cambió el stock
    if (req.body.stock !== undefined) {
      emitStockUpdate(id, req.body.stock);
    }
  }
  res.json({ ok: true });
});

app.delete('/api/productos/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  await Producto.destroy({ where: { id } });
  // Emitir que el producto fue eliminado
  io.emit('producto-eliminado', { productoId: id });
  res.json({ ok: true });
});

// Endpoint para crear una orden de compra
app.post('/api/ordenes', async (req, res) => {
  try {
    const { nombre, email, telefono, direccion, total, items } = req.body;
    if (!nombre || !email || !telefono || !direccion || !total || !items) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    
    // Validar stock antes de crear la orden
    for (const item of items) {
      const producto = await Producto.findByPk(item.id);
      if (!producto || (producto.stock || 0) < item.cantidad) {
        return res.status(400).json({ 
          error: `Stock insuficiente para ${item.nombre}` 
        });
      }
    }
    
    const orden = await Orden.create({ nombre, email, telefono, direccion, total, items });
    res.json({ ok: true, orden });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear la orden' });
  }
});

// ENDPOINTS DE ÓRDENES (solo admin)
app.get('/api/ordenes', authMiddleware, async (req, res) => {
  try {
    const ordenes = await Orden.findAll({ order: [['createdAt', 'DESC']] });
    res.json(ordenes);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener las órdenes' });
  }
});

app.get('/api/ordenes/:id', authMiddleware, async (req, res) => {
  try {
    const orden = await Orden.findByPk(req.params.id);
    if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });
    res.json(orden);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener la orden' });
  }
});

// Endpoint modificado para manejar stock
app.put('/api/ordenes/:id', authMiddleware, async (req, res) => {
  try {
    const { estado } = req.body;
    const orden = await Orden.findByPk(req.params.id);
    if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });
    
    const estadoAnterior = orden.estado;
    orden.estado = estado;
    await orden.save();

    // Descontar stock si pasa de pendiente a otro estado (excepto cancelado)
    if (estadoAnterior === 'pendiente' && estado !== 'pendiente' && estado !== 'cancelado') {
      console.log(`Descontando stock para orden ${orden.id}: ${estadoAnterior} -> ${estado}`);
      for (const item of orden.items) {
        const producto = await Producto.findByPk(item.id);
        if (producto) {
          const nuevoStock = Math.max(0, (producto.stock || 0) - item.cantidad);
          producto.stock = nuevoStock;
          await producto.save();
          
          console.log(`Stock actualizado para producto ${producto.id}: ${producto.stock} -> ${nuevoStock}`);
          // Emitir actualización de stock
          emitStockUpdate(item.id, nuevoStock);
        }
      }
    }

    // Devolver stock si se cancela el pedido
    if (estadoAnterior !== 'cancelado' && estado === 'cancelado') {
      console.log(`Devolviendo stock para orden ${orden.id}: ${estadoAnterior} -> ${estado}`);
      for (const item of orden.items) {
        const producto = await Producto.findByPk(item.id);
        if (producto) {
          const nuevoStock = (producto.stock || 0) + item.cantidad;
          producto.stock = nuevoStock;
          await producto.save();
          
          console.log(`Stock devuelto para producto ${producto.id}: ${producto.stock} -> ${nuevoStock}`);
          // Emitir actualización de stock
          emitStockUpdate(item.id, nuevoStock);
        }
      }
    }

    res.json({ ok: true, orden });
  } catch (err) {
    console.error('Error al actualizar orden:', err);
    res.status(500).json({ error: 'Error al actualizar la orden' });
  }
});

// Endpoint para crear preferencia de pago Mercado Pago
app.post('/api/pago/mercadopago', async (req, res) => {
  try {
    const { items, nombre, email } = req.body;
    // items: [{ nombre, cantidad, precio }]
    const prefBody = {
      items: items.map(item => ({
        title: item.nombre,
        quantity: item.cantidad,
        unit_price: Number(item.precio),
        currency_id: "ARS"
      })),
      payer: {
        name: nombre,
        email: email
      },
      back_urls: {
        success: "https://frontriocuartocelulares.vercel.app/checkout?status=success",
        failure: "https://frontriocuartocelulares.vercel.app/checkout?status=failure",
        pending: "https://frontriocuartocelulares.vercel.app/checkout?status=pending"
      },
      auto_return: "approved"
    };
    console.log('Preference body enviado a Mercado Pago:', JSON.stringify(prefBody, null, 2));
    const response = await preference.create({ body: prefBody });
    res.json({ id: response.id, init_point: response.init_point });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear preferencia de pago" });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Servidor backend en puerto ${PORT}`));

process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', err => {
  console.error('Unhandled Rejection:', err);
});

// debug: comprobar cómo resuelve el host de la DB en este entorno
const supaHost = (() => {
  try {
    const conn = process.env.PG_CONNECTION_STRING || process.env.DATABASE_URL || '';
    const afterAt = conn.split('@')[1];
    if (afterAt) return afterAt.split(':')[0];
    return process.env.DB_HOST || null;
  } catch (e) {
    return null;
  }
})();
if (supaHost) {
  dns.lookup(supaHost, { all: true }, (err, addresses) => {
    if (err) console.error('DNS lookup error for', supaHost, err);
    else console.log('DNS lookup for', supaHost, addresses);
  });
}
