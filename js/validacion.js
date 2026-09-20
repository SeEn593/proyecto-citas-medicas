/**
 * validacion.js
 * Validaciones del lado del cliente con Expresiones Regulares
 * Proyecto: MEDICITAS
 */

// Patrones Regex
const REGEX = {
  cedula: /^\d{10}$/,
  correo: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  telefono: /^\d{10}$/,
  nombre: /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]{3,60}$/
};

// Mensajes de error
const MENSAJES = {
  nombre: 'Ingrese un nombre válido (solo letras, mín. 3 caracteres).',
  cedula: 'La cédula debe tener exactamente 10 dígitos numéricos.',
  correo: 'Ingrese un correo válido (ej: usuario@dominio.com).',
  telefono: 'El teléfono debe tener 10 dígitos numéricos.',
  especialidad: 'Debe seleccionar una especialidad.',
  fecha: 'Debe seleccionar una fecha válida (no anterior a hoy).',
  hora: 'Debe seleccionar un horario disponible.'
};

/**
 * Muestra u oculta el mensaje de error de un campo
 */
function setError(input, mensaje) {
  const errorSpan = document.getElementById('error' + capitalizar(input.id));
  if (mensaje) {
    input.classList.add('invalido');
    input.setAttribute('aria-invalid', 'true');
    if (errorSpan) errorSpan.textContent = mensaje;
  } else {
    input.classList.remove('invalido');
    input.removeAttribute('aria-invalid');
    if (errorSpan) errorSpan.textContent = '';
  }
}

function capitalizar(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Valida un campo individual según su id
 */
function validarCampo(input) {
  const valor = input.value.trim();
  let error = '';

  switch (input.id) {
    case 'nombre':
      if (!REGEX.nombre.test(valor)) error = MENSAJES.nombre;
      break;
    case 'cedula':
      if (!REGEX.cedula.test(valor)) error = MENSAJES.cedula;
      break;
    case 'correo':
      if (!REGEX.correo.test(valor)) error = MENSAJES.correo;
      break;
    case 'telefono':
      if (!REGEX.telefono.test(valor)) error = MENSAJES.telefono;
      break;
    case 'especialidad':
      if (!valor) error = MENSAJES.especialidad;
      break;
    case 'fecha':
      if (!valor) {
        error = MENSAJES.fecha;
      } else {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const seleccionada = new Date(valor + 'T00:00:00');
        if (seleccionada < hoy) error = 'La fecha no puede ser anterior a hoy.';
      }
      break;
    case 'hora':
      if (!valor) error = MENSAJES.hora;
      break;
  }

  setError(input, error);
  return error === '';
}

/**
 * Valida el formulario completo
 */
function validarFormulario() {
  const campos = ['nombre', 'cedula', 'correo', 'telefono', 'especialidad', 'fecha', 'hora'];
  let valido = true;

  campos.forEach(id => {
    const input = document.getElementById(id);
    if (!validarCampo(input)) valido = false;
  });

  return valido;
}

// Validación en tiempo real
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formCita');
  if (!form) return;

  const campos = ['nombre', 'cedula', 'correo', 'telefono', 'especialidad', 'fecha', 'hora'];

  campos.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('blur', () => validarCampo(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('invalido')) validarCampo(input);
      });
    }
  });

  // Interceptar submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (validarFormulario()) {
      if (typeof registrarCita === 'function') {
        registrarCita(new FormData(form));
      }
    } else {
      const primerInvalido = form.querySelector('.invalido');
      if (primerInvalido) primerInvalido.focus();
    }
  });
});