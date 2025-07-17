const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', productosController.listarProductos);
router.post('/', authMiddleware, productosController.crearProducto);
router.put('/:id', authMiddleware, productosController.actualizarProducto);
router.delete('/:id', authMiddleware, productosController.eliminarProducto);

module.exports = router; 