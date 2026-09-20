/**
 * servidor.js
 * Servidor web Backend - MEDICITAS
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const citaRoutes = require('./routes/citaRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ============ MIDDLEWARES ============
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Log de peticiones
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// ============ ARCHIVOS ESTÁTICOS ============
app.use(express.static(path.join(__dirname)));

// ============ RUTAS API ============
app.use('/api', citaRoutes);

// ============ RUTA PRINCIPAL ============
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ============ MANEJO DE 404 ============
app.use((req, res) => {
  if (req.url.startsWith('/api')) {
    res.status(404).json({ ok: false, error: 'Endpoint no encontrado' });
  } else {
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
  }
});

// ============ MANEJO DE ERRORES ============
app.use((err, req, res, next) => {
  console.error('❌ Error del servidor:', err.message);
  res.status(500).json({ ok: false, error: 'Error interno del servidor' });
});

// ============ INICIAR SERVIDOR ============
app.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('  🏥 MEDICITAS - Servidor Activo');
  console.log('═══════════════════════════════════════════');
  console.log(`  🌐 URL:    http://localhost:${PORT}`);
  console.log(`  📡 API:    http://localhost:${PORT}/api`);
  console.log(`  🗄️  MySQL:  ${process.env.DB_NAME}`);
  console.log(`  🔧 Modo:   ${process.env.NODE_ENV || 'development'}`);
  console.log('═══════════════════════════════════════════');
  console.log('');
});

module.exports = app;