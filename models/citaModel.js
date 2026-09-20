/**
 * citaModel.js
 * Consultas SQL / Persistencia - MEDICITAS
 */
const db = require('../config/db');

const Cita = {
  // Obtener todas las citas con filtros
  obtenerTodas: async (filtros = {}) => {
    let sql = `SELECT c.*, e.nombre AS especialidad_nombre, e.icono 
               FROM citas c
               LEFT JOIN especialidades e ON c.especialidad = e.codigo
               WHERE 1=1`;
    const params = [];

    if (filtros.cedula) {
      sql += ' AND c.cedula = ?';
      params.push(filtros.cedula);
    }
    if (filtros.fecha) {
      sql += ' AND c.fecha = ?';
      params.push(filtros.fecha);
    }
    if (filtros.especialidad) {
      sql += ' AND c.especialidad = ?';
      params.push(filtros.especialidad);
    }
    if (filtros.estado) {
      sql += ' AND c.estado = ?';
      params.push(filtros.estado);
    }

    sql += ' ORDER BY c.fecha ASC, c.hora ASC';
    const [rows] = await db.query(sql, params);
    return rows;
  },

  // Obtener cita por ID
  obtenerPorId: async (id) => {
    const [rows] = await db.query(
      `SELECT c.*, e.nombre AS especialidad_nombre, e.icono 
       FROM citas c
       LEFT JOIN especialidades e ON c.especialidad = e.codigo
       WHERE c.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  // Verificar si horario está ocupado
  horarioOcupado: async (especialidad, fecha, hora) => {
    const [rows] = await db.query(
      `SELECT id FROM citas 
       WHERE especialidad = ? AND fecha = ? AND hora = ? 
       AND estado != 'cancelada'`,
      [especialidad, fecha, hora]
    );
    return rows.length > 0;
  },

  // Horarios disponibles
  horariosDisponibles: async (especialidad, fecha) => {
    const HORARIOS_BASE = [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
      '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];

    const [rows] = await db.query(
      `SELECT hora FROM citas 
       WHERE especialidad = ? AND fecha = ? AND estado != 'cancelada'`,
      [especialidad, fecha]
    );

    const ocupados = rows.map(r => r.hora.substring(0, 5));
    return HORARIOS_BASE.filter(h => !ocupados.includes(h));
  },

  // Crear cita
  crear: async (cita) => {
    const { nombre, cedula, correo, telefono, especialidad, fecha, hora } = cita;
    const [result] = await db.query(
      `INSERT INTO citas (nombre, cedula, correo, telefono, especialidad, fecha, hora)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre, cedula, correo, telefono, especialidad, fecha, hora]
    );
    return { id: result.insertId, ...cita };
  },

  // Actualizar cita
  actualizar: async (id, datos) => {
    const campos = [];
    const valores = [];

    for (const [key, value] of Object.entries(datos)) {
      if (['nombre', 'cedula', 'correo', 'telefono', 'especialidad', 'fecha', 'hora', 'estado'].includes(key)) {
        campos.push(`${key} = ?`);
        valores.push(value);
      }
    }

    if (campos.length === 0) return null;

    valores.push(id);
    const [result] = await db.query(
      `UPDATE citas SET ${campos.join(', ')} WHERE id = ?`,
      valores
    );
    return result.affectedRows > 0 ? { id, ...datos } : null;
  },

  // Eliminar cita
  eliminar: async (id) => {
    const [result] = await db.query('DELETE FROM citas WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  // Obtener especialidades
  obtenerEspecialidades: async () => {
    const [rows] = await db.query('SELECT * FROM especialidades ORDER BY nombre');
    return rows;
  }
};

module.exports = Cita;