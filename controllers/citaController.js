/**
 * citaController.js
 * Controlador MVC - MEDICITAS
 */
const Cita = require('../models/citaModel');

const REGEX = {
  cedula: /^\d{10}$/,
  correo: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  telefono: /^\d{10}$/,
  nombre: /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]{3,60}$/
};

// GET /api/citas
exports.listar = async (req, res) => {
  try {
    const filtros = {
      cedula: req.query.cedula,
      fecha: req.query.fecha,
      especialidad: req.query.especialidad,
      estado: req.query.estado
    };
    const citas = await Cita.obtenerTodas(filtros);
    res.json({ ok: true, total: citas.length, data: citas });
  } catch (error) {
    console.error('❌ Error en listar:', error.message);
    res.status(500).json({ ok: false, error: 'Error al obtener las citas' });
  }
};

// GET /api/citas/:id
exports.obtener = async (req, res) => {
  try {
    const cita = await Cita.obtenerPorId(req.params.id);
    if (!cita) return res.status(404).json({ ok: false, error: 'Cita no encontrada' });
    res.json({ ok: true, data: cita });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// POST /api/citas
exports.crear = async (req, res) => {
  try {
    const { nombre, cedula, correo, telefono, especialidad, fecha, hora } = req.body;

    // Validar campos obligatorios
    const faltantes = [];
    if (!nombre) faltantes.push('nombre');
    if (!cedula) faltantes.push('cedula');
    if (!correo) faltantes.push('correo');
    if (!telefono) faltantes.push('telefono');
    if (!especialidad) faltantes.push('especialidad');
    if (!fecha) faltantes.push('fecha');
    if (!hora) faltantes.push('hora');

    if (faltantes.length > 0) {
      return res.status(400).json({
        ok: false,
        error: 'Faltan campos obligatorios',
        campos: faltantes
      });
    }

    // Validar formato
    const errores = {};
    if (!REGEX.nombre.test(nombre)) errores.nombre = 'Nombre inválido';
    if (!REGEX.cedula.test(cedula)) errores.cedula = 'Cédula debe tener 10 dígitos';
    if (!REGEX.correo.test(correo)) errores.correo = 'Correo inválido';
    if (!REGEX.telefono.test(telefono)) errores.telefono = 'Teléfono debe tener 10 dígitos';

    if (Object.keys(errores).length > 0) {
      return res.status(400).json({ ok: false, error: 'Datos inválidos', detalles: errores });
    }

    // Validar fecha no pasada
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaCita = new Date(fecha + 'T00:00:00');
    if (fechaCita < hoy) {
      return res.status(400).json({ ok: false, error: 'La fecha no puede ser anterior a hoy' });
    }

    // Verificar horario ocupado
    const ocupado = await Cita.horarioOcupado(especialidad, fecha, hora);
    if (ocupado) {
      return res.status(409).json({
        ok: false,
        error: 'Ese horario ya está reservado. Elija otro.'
      });
    }

    // Crear cita
    const nueva = await Cita.crear({ nombre, cedula, correo, telefono, especialidad, fecha, hora });

    res.status(201).json({
      ok: true,
      mensaje: '✅ MEDICITAS: Cita registrada exitosamente',
      data: nueva
    });

  } catch (error) {
    console.error('❌ Error en crear:', error.message);
    res.status(500).json({ ok: false, error: 'Error al crear la cita' });
  }
};

// PUT /api/citas/:id
exports.actualizar = async (req, res) => {
  try {
    const actualizada = await Cita.actualizar(req.params.id, req.body);
    if (!actualizada) return res.status(404).json({ ok: false, error: 'Cita no encontrada o sin cambios' });
    res.json({ ok: true, mensaje: 'Cita actualizada', data: actualizada });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// DELETE /api/citas/:id
exports.eliminar = async (req, res) => {
  try {
    const eliminada = await Cita.eliminar(req.params.id);
    if (!eliminada) return res.status(404).json({ ok: false, error: 'Cita no encontrada' });
    res.json({ ok: true, mensaje: '✅ Cita cancelada en MEDICITAS' });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// GET /api/horarios
exports.horariosDisponibles = async (req, res) => {
  try {
    const { especialidad, fecha } = req.query;
    if (!especialidad || !fecha) {
      return res.status(400).json({ ok: false, error: 'Faltan parámetros: especialidad y fecha' });
    }
    const horarios = await Cita.horariosDisponibles(especialidad, fecha);
    res.json({ ok: true, data: horarios });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// GET /api/especialidades
exports.especialidades = async (req, res) => {
  try {
    const lista = await Cita.obtenerEspecialidades();
    res.json({ ok: true, data: lista });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};