/**
 * citaRoutes.js
 * Endpoints RESTful - MEDICITAS
 */
const express = require('express');
const router = express.Router();
const citaController = require('../controllers/citaController');

// Especialidades
router.get('/especialidades', citaController.especialidades);

// Horarios disponibles
router.get('/horarios', citaController.horariosDisponibles);

// CRUD de citas
router.get('/citas', citaController.listar);
router.get('/citas/:id', citaController.obtener);
router.post('/citas', citaController.crear);
router.put('/citas/:id', citaController.actualizar);
router.delete('/citas/:id', citaController.eliminar);

module.exports = router;