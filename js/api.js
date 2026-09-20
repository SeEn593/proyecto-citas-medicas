/**
 * api.js
 * Consumo de APIs mediante fetch() y async/await
 * Proyecto: MEDICITAS
 */

const API_BASE = '/api';

/**
 * GET - Obtener citas desde el backend
 */
async function obtenerCitasAPI() {
  try {
    const respuesta = await fetch(`${API_BASE}/citas`);
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
    const datos = await respuesta.json();
    console.log('✅ MEDICITAS - Citas obtenidas:', datos);
    return datos;
  } catch (error) {
    console.warn('⚠️ MEDICITAS - Backend no disponible, usando localStorage:', error.message);
    return JSON.parse(localStorage.getItem('medicitas_citas')) || [];
  }
}

/**
 * POST - Crear nueva cita
 */
async function crearCitaAPI(cita) {
  try {
    const respuesta = await fetch(`${API_BASE}/citas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cita)
    });
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
    return await respuesta.json();
  } catch (error) {
    console.warn('⚠️ MEDICITAS - No se pudo guardar en backend:', error.message);
    return null;
  }
}

/**
 * DELETE - Cancelar cita
 */
async function eliminarCitaAPI(id) {
  try {
    const respuesta = await fetch(`${API_BASE}/citas/${id}`, { method: 'DELETE' });
    return respuesta.ok;
  } catch (error) {
    console.error('MEDICITAS - Error al eliminar:', error);
    return false;
  }
}

/**
 * GET - Consultar API pública de prueba
 */
async function consultarAPIExterna() {
  try {
    const r = await fetch('https://jsonplaceholder.typicode.com/users/1');
    const data = await r.json();
    console.log('🌐 MEDICITAS - API externa:', data);
    return data;
  } catch (e) {
    console.error('MEDICITAS - Error API externa:', e);
  }
}