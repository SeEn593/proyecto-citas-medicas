🏥 MEDICITAS - Plataforma Web para la Gestión y Reserva de Citas Médicas

Asignatura: Desarrollo de Entornos Web
Docente: Ing. Héctor Vladimir Robayo Villarroel, Msc.
Estudiante: Carlos Sebastián Yunga Enderica
Carrera: Sistemas de la información y Ciberseguridad
Institución: Instituto Tecnológico Superior España

1. Descripción del Proyecto

MEDICITAS es un sistema web dinámico e interactivo diseñado bajo la arquitectura Cliente-Servidor que automatiza el flujo completo de atención a usuarios en centros de salud. Permite:

- Consultar especialidades médicas disponibles.
- Verificar horarios disponibles en tiempo real.
- Agendar citas de forma totalmente digital.
- Gestionar y cancelar reservas.
- Reemplazar los procesos manuales presenciales por un canal digital continuo (24/7).

Objetivo General
Desarrollar una plataforma web que permita a los pacientes reservar citas médicas en línea desde cualquier dispositivo, reduciendo filas, llamadas y uso de papel, mientras el personal administrativo obtiene control organizado sobre la agenda.

Beneficios
- Cero Papel y Sostenibilidad elimina tickets y fichas físicas.
- Eficiencia Operativa: reduce filas presenciales y llamadas telefónicas.
- Disponibilidad Inmediata: validación en tiempo real sin recargar la interfaz.
- Accesibilidad e Inclusión: diseño responsive bajo estándares WCAG.
## 🔐 Nota sobre Seguridad

Por buenas prácticas de seguridad, el archivo `.env` (que contiene 
credenciales reales de MySQL) **NO se incluye** en este proyecto.

En su lugar, se proporciona `.env.example` como plantilla. Para ejecutar:

1. Copiar `.env.example` a `.env`
2. Configurar las credenciales locales de MySQL
3. Ejecutar `npm install` y `npm run dev`