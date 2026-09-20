/**
 * app.js
 * Lógica del DOM, eventos y datos dinámicos
 * Proyecto: MEDICITAS
 */

// ============ DATOS SIMULADOS ============
const ESPECIALIDADES = [
  { id: 'medicina-general', nombre: 'Medicina General', icono: '🩺', desc: 'Atención primaria y preventiva' },
  { id: 'pediatria',        nombre: 'Pediatría',        icono: '👶', desc: 'Salud infantil y adolescente' },
  { id: 'cardiologia',      nombre: 'Cardiología',      icono: '❤️', desc: 'Corazón y sistema circulatorio' },
  { id: 'dermatologia',     nombre: 'Dermatología',     icono: '🧴', desc: 'Cuidado de la piel' },
  { id: 'odontologia',      nombre: 'Odontología',      icono: '🦷', desc: 'Salud bucal' },
  { id: 'ginecologia',      nombre: 'Ginecología',      icono: '👩‍⚕️', desc: 'Salud femenina' }
];

const HORARIOS_BASE = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
];

// Almacén de citas (localStorage como respaldo)
let citas = JSON.parse(localStorage.getItem('medicitas_citas')) || [];

// ============ RENDERIZAR CATÁLOGO ============
const renderizarEspecialidades = () => {
  const contenedor = document.getElementById('gridEspecialidades');
  if (!contenedor) return;

  contenedor.innerHTML = ESPECIALIDADES.map(esp => `
    <article class="card-especialidad" tabindex="0" data-id="${esp.id}" role="button"
             aria-label="Seleccionar especialidad ${esp.nombre}">
      <div style="font-size:2.5rem" aria-hidden="true">${esp.icono}</div>
      <h3>${esp.nombre}</h3>
      <p>${esp.desc}</p>
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

const seleccionarEspecialidad = (id) => {
  const select = document.getElementById('especialidad');
  select.value = id;
  select.dispatchEvent(new Event('change'));
  document.getElementById('agendar').scrollIntoView({ behavior: 'smooth' });
};

// ============ HORARIOS DINÁMICOS ============
const actualizarHorarios = () => {
  const fecha = document.getElementById('fecha').value;
  const especialidad = document.getElementById('especialidad').value;
  const selectHora = document.getElementById('hora');

  if (!fecha || !especialidad) {
    selectHora.disabled = true;
    selectHora.innerHTML = '<option value="">Seleccione fecha y especialidad</option>';
    return;
  }

  const semilla = fecha + especialidad;
  const ocupados = HORARIOS_BASE.filter((_, i) => {
    let hash = 0;
    for (const c of semilla) hash = (hash * 31 + c.charCodeAt(0)) % 997;
    return (hash + i) % 4 === 0;
  });

  const disponibles = HORARIOS_BASE.filter(h => !ocupados.includes(h));

  selectHora.disabled = false;
  selectHora.innerHTML = '<option value="">-- Seleccione horario --</option>' +
    disponibles.map(h => `<option value="${h}">${h}</option>`).join('');

  if (disponibles.length === 0) {
    selectHora.innerHTML = '<option value="">No hay horarios disponibles</option>';
    selectHora.disabled = true;
  }
};

// ============ REGISTRAR CITA ============
const registrarCita = (formData) => {
  const nuevaCita = {
    id: Date.now(),
    nombre: formData.get('nombre'),
    cedula: formData.get('cedula'),
    correo: formData.get('correo'),
    telefono: formData.get('telefono'),
    especialidad: formData.get('especialidad'),
    fecha: formData.get('fecha'),
    hora: formData.get('hora'),
    creadaEn: new Date().toISOString()
  };

  const duplicado = citas.some(c =>
    c.fecha === nuevaCita.fecha &&
    c.hora === nuevaCita.hora &&
    c.especialidad === nuevaCita.especialidad
  );

  if (duplicado) {
    mostrarMensaje('⚠️ MEDICITAS: Ese horario ya fue reservado. Elija otro.', false);
    return;
  }

  citas.push(nuevaCita);
  localStorage.setItem('medicitas_citas', JSON.stringify(citas));

  mostrarMensaje(`✅ MEDICITAS: Cita confirmada para ${nuevaCita.fecha} a las ${nuevaCita.hora}`, true);
  renderizarCitas();
  document.getElementById('formCita').reset();
  document.getElementById('hora').disabled = true;
  document.getElementById('hora').innerHTML = '<option value="">Seleccione una fecha primero</option>';
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

// ============ RENDERIZAR CITAS ============
const renderizarCitas = () => {
  const contenedor = document.getElementById('listaCitas');
  if (!contenedor) return;

  if (citas.length === 0) {
    contenedor.innerHTML = '<p class="vacio">Aún no tienes citas registradas en MEDICITAS.</p>';
    return;
  }

  contenedor.innerHTML = citas.map(cita => {
    const esp = ESPECIALIDADES.find(e => e.id === cita.especialidad);
    return `
      <article class="cita-item">
        <div>
          <strong>${esp ? esp.icono + ' ' + esp.nombre : cita.especialidad}</strong><br>
          <span>👤 ${cita.nombre}</span><br>
          <span>📅 ${cita.fecha} — 🕐 ${cita.hora}</span>
        </div>
        <button onclick="cancelarCita(${cita.id})" aria-label="Cancelar cita">Cancelar</button>
      </article>
    `;
  }).join('');
};

const cancelarCita = (id) => {
  if (!confirm('¿Desea cancelar esta cita en MEDICITAS?')) return;
  citas = citas.filter(c => c.id !== id);
  localStorage.setItem('medicitas_citas', JSON.stringify(citas));
  renderizarCitas();
};

// ============ INICIALIZACIÓN ============
document.addEventListener('DOMContentLoaded', () => {
  renderizarEspecialidades();
  renderizarCitas();

  const fechaInput = document.getElementById('fecha');
  const hoy = new Date().toISOString().split('T')[0];
  fechaInput.min = hoy;

  fechaInput.addEventListener('change', actualizarHorarios);
  document.getElementById('especialidad').addEventListener('change', actualizarHorarios);
});