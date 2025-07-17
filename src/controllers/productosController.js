const Producto = require('../models/Producto');

exports.listarProductos = async (req, res) => {
  const productos = await Producto.findAll();
  res.json(productos);
};

exports.crearProducto = async (req, res) => {
  const { nombre, descripcion, precio, imagen, stock, categoria, subcategoria } = req.body;
  if (!nombre || !precio || !categoria || !subcategoria) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  const prod = await Producto.create({ nombre, descripcion, precio, imagen, stock, categoria, subcategoria });
  res.json(prod);
};

exports.actualizarProducto = async (req, res) => {
  const { id } = req.params;
  await Producto.update(req.body, { where: { id } });
  res.json({ ok: true });
};

exports.eliminarProducto = async (req, res) => {
  const { id } = req.params;
  await Producto.destroy({ where: { id } });
  res.json({ ok: true });
}; 