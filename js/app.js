/**
 * app.js
 * Lógica del DOM, eventos y datos dinámicos
 * Proyecto: MEDICITAS - Versión con API
 */

// ============ DATOS DE RESPALDO ============
const ESPECIALIDADES_FALLBACK = [
  { codigo: 'medicina-general', nombre: 'Medicina General', icono: '🩺', descripcion: 'Atención primaria y preventiva' },
  { codigo: 'pediatria',        nombre: 'Pediatría',        icono: '👶', descripcion: 'Salud infantil y adolescente' },
  { codigo: 'cardiologia',      nombre: 'Cardiología',      icono: '❤️', descripcion: 'Corazón y sistema circulatorio' },
  { codigo: 'dermatologia',     nombre: 'Dermatología',     icono: '🧴', descripcion: 'Cuidado de la piel' },
  { codigo: 'odontologia',      nombre: 'Odontología',      icono: '🦷', descripcion: 'Salud bucal' },
  { codigo: 'ginecologia',      nombre: 'Ginecología',      icono: '👩‍⚕️', descripcion: 'Salud femenina' }
];

let citas = [];
let especialidades = [];

// ============ CARGAR ESPECIALIDADES DESDE LA API ============
const cargarEspecialidades = async () => {
  try {
    const respuesta = await fetch('/api/especialidades');
    const data = await respuesta.json();
    if (data.ok && data.data.length > 0) {
      especialidades = data.data.map(e => ({
        codigo: e.codigo,
        nombre: e.nombre,
        icono: e.icono || '🩺',
        descripcion: e.descripcion
      }));
      console.log('✅ Especialidades cargadas desde API:', especialidades.length);
    } else {
      especialidades = ESPECIALIDADES_FALLBACK;
    }
  } catch (error) {
    console.warn('⚠️ Usando fallback de especialidades:', error.message);
    especialidades = ESPECIALIDADES_FALLBACK;
  }
  renderizarEspecialidades();
};

// ============ RENDERIZAR CATÁLOGO ============
const renderizarEspecialidades = () => {
  const contenedor = document.getElementById('gridEspecialidades');
  if (!contenedor) return;

  contenedor.innerHTML = especialidades.map(esp => `
    <article class="card-especialidad" tabindex="0" data-id="${esp.codigo}" role="button"
             aria-label="Seleccionar especialidad ${esp.nombre}">
      <div style="font-size:2.5rem" aria-hidden="true">${esp.icono}</div>
      <h3>${esp.nombre}</h3>
      <p>${esp.descripcion || ''}</p>
    </article>
  `).join('');

  contenedor.querySelectorAll('.card-especialidad').forEach(card => {
    card.addEventListener('click', () => seleccionarEspecialidad(card.dataset.id));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        seleccionarEspecialidad(card.dataset.id);
      }
    });
  });
};

const seleccionarEspecialidad = (codigo) => {
  const select = document.getElementById('especialidad');
  select.value = codigo;
  select.dispatchEvent(new Event('change'));
  document.getElementById('agendar').scrollIntoView({ behavior: 'smooth' });
};

// ============ HORARIOS DINÁMICOS ============
const actualizarHorarios = async () => {
  const fecha = document.getElementById('fecha').value;
  const especialidad = document.getElementById('especialidad').value;
  const selectHora = document.getElementById('hora');

  if (!fecha || !especialidad) {
    selectHora.disabled = true;
    selectHora.innerHTML = '<option value="">Seleccione fecha y especialidad</option>';
    return;
  }

  try {
    const respuesta = await fetch(`/api/horarios?especialidad=${especialidad}&fecha=${fecha}`);
    const data = await respuesta.json();
    
    selectHora.disabled = false;
    selectHora.innerHTML = '<option value="">-- Seleccione horario --</option>';
    
    if (data.ok && data.data.length > 0) {
      data.data.forEach(h => {
        selectHora.innerHTML += `<option value="${h}">${h}</option>`;
      });
    } else {
      selectHora.innerHTML = '<option value="">No hay horarios disponibles</option>';
      selectHora.disabled = true;
    }
  } catch (error) {
    console.error('Error al cargar horarios:', error);
    selectHora.innerHTML = '<option value="">Error al cargar horarios</option>';
  }
};

// ============ REGISTRAR CITA (POST a la API) ============
const registrarCita = async (formData) => {
  const nuevaCita = {
    nombre: formData.get('nombre'),
    cedula: formData.get('cedula'),
    correo: formData.get('correo'),
    telefono: formData.get('telefono'),
    especialidad: formData.get('especialidad'),
    fecha: formData.get('fecha'),
    hora: formData.get('hora')
  };

  try {
    const respuesta = await fetch('/api/citas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevaCita)
    });
    const data = await respuesta.json();

    if (respuesta.ok && data.ok) {
      mostrarMensaje(`✅ MEDICITAS: Cita confirmada para ${nuevaCita.fecha} a las ${nuevaCita.hora}`, true);
      document.getElementById('formCita').reset();
      document.getElementById('hora').disabled = true;
      document.getElementById('hora').innerHTML = '<option value="">Seleccione una fecha primero</option>';
      await cargarCitasDesdeAPI();
    } else {
      mostrarMensaje('⚠️ ' + (data.error || 'Error al crear la cita'), false);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    mostrarMensaje('❌ Error de conexión con el servidor', false);
  }
};

const mostrarMensaje = (texto, exito) => {
  const div = document.getElementById('mensajeExito');
  div.textContent = texto;
  div.hidden = false;
  div.style.background = exito ? '#d1fae5' : '#fee2e2';
  div.style.color = exito ? '#065f46' : '#991b1b';
  div.style.borderLeftColor = exito ? '#00a878' : '#c1121f';
  setTimeout(() => { div.hidden = true; }, 5000);
};

// ============ CARGAR CITAS DESDE LA API ============
const cargarCitasDesdeAPI = async () => {
  try {
    const respuesta = await fetch('/api/citas');
    const data = await respuesta.json();
    citas = data.ok ? data.data : [];
    renderizarCitas();
  } catch (error) {
    console.error('Error al cargar citas:', error);
    citas = [];
    renderizarCitas();
  }
};

// ============ RENDERIZAR CITAS ============
const renderizarCitas = () => {
  const contenedor = document.getElementById('listaCitas');
  if (!contenedor) return;

  if (citas.length === 0) {
    contenedor.innerHTML = '<p class="vacio">Aún no tienes citas registradas en MEDICITAS.</p>';
    return;
  }

  contenedor.innerHTML = citas.map(cita => {
    const esp = especialidades.find(e => e.codigo === cita.especialidad);
    const fechaFormato = cita.fecha ? cita.fecha.split('T')[0] : cita.fecha;
    return `
      <article class="cita-item">
        <div>
          <strong>${esp ? esp.icono + ' ' + esp.nombre : cita.especialidad}</strong><br>
          <span>👤 ${cita.nombre}</span><br>
          <span>📅 ${fechaFormato} — 🕐 ${cita.hora}</span>
        </div>
        <button onclick="cancelarCita(${cita.id})" aria-label="Cancelar cita">Cancelar</button>
      </article>
    `;
  }).join('');
};

// ============ CANCELAR CITA (DELETE) ============
const cancelarCita = async (id) => {
  if (!confirm('¿Desea cancelar esta cita en MEDICITAS?')) return;
  try {
    const respuesta = await fetch(`/api/citas/${id}`, { method: 'DELETE' });
    const data = await respuesta.json();
    if (data.ok) {
      await cargarCitasDesdeAPI();
    } else {
      alert('Error al cancelar: ' + data.error);
    }
  } catch (error) {
    alert('Error de conexión');
  }
};

// ============ INICIALIZACIÓN ============
document.addEventListener('DOMContentLoaded', async () => {
  await cargarEspecialidades();
  await cargarCitasDesdeAPI();

  const fechaInput = document.getElementById('fecha');
  if (fechaInput) {
    const hoy = new Date().toISOString().split('T')[0];
    fechaInput.min = hoy;
    fechaInput.addEventListener('change', actualizarHorarios);
  }

  const selectEspecialidad = document.getElementById('especialidad');
  if (selectEspecialidad) {
    selectEspecialidad.addEventListener('change', actualizarHorarios);
  }
});