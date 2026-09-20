/**
 * db.js
 * Configuración de conexión a MySQL - MEDICITAS
 */
require('dotenv').config();
const mysql = require('mysql2');

// Pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'citas_medicas',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4_unicode_ci'
});

// Probar conexión al iniciar
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ MEDICITAS - Error de conexión MySQL:');
    console.error('   Código:', err.code);
    console.error('   Mensaje:', err.message);
    console.error('   👉 Verifica tu archivo .env y que MySQL esté corriendo.');
    return;
  }
  console.log('✅ MEDICITAS - Conectado a MySQL (' + process.env.DB_NAME + ')');
  connection.release();
});

// Exportar versión con promesas
module.exports = pool.promise();