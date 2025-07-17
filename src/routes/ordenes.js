const express = require('express');
const router = express.Router();
const ordenesController = require('../controllers/ordenesController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', ordenesController.crearOrden);
router.get('/', authMiddleware, ordenesController.listarOrdenes);
router.put('/:id', authMiddleware, ordenesController.actualizarEstado);

module.exports = router; 