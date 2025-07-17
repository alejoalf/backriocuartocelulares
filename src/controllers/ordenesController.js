const Orden = require('../models/Orden');

exports.crearOrden = async (req, res) => {
  console.log(">>> LLEGA A LA FUNCIÓN crearOrden"); // Log de depuración
  try {
    console.log("Body recibido:", req.body);
    const { nombre, email, telefono, direccion, total, items } = req.body;
    if (!nombre || !email || !telefono || !direccion || !total || !items) {
      console.log("Faltan campos obligatorios");
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    console.log("Intentando crear orden...");
    const orden = await Orden.create({ nombre, email, telefono, direccion, total, items });
    console.log("Orden creada:", orden);
    res.json({ ok: true, orden });
  } catch (err) {
    console.error("Error al crear la orden:", err);
    res.status(500).json({ error: 'Error al crear la orden' });
  }
};

exports.listarOrdenes = async (req, res) => {
  try {
    const ordenes = await Orden.findAll({ order: [['createdAt', 'DESC']] });
    res.json(ordenes);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener las órdenes' });
  }
};

exports.actualizarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    if (!estado) return res.status(400).json({ error: 'Falta el estado' });
    await Orden.update({ estado }, { where: { id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el estado de la orden' });
  }
}; 