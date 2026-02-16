# 🚀 Novedades y Mejoras - DataGymRoutines (16 Feb 2026)

¡Hola equipo de testing! Hemos estado trabajando en pulir la experiencia de uso y añadir funcionalidades clave para que el seguimiento de vuestros entrenamientos sea más fluido y motivador. Aquí tenéis un resumen de lo que hemos implementado hoy:

---

## 📈 1. Nuevo Historial de Entrenamientos
Hemos rediseñado el panel de historial en el Dashboard para que sea mucho más que una lista de días.

*   **Filtros de Período**: Ahora puedes alternar fácilmente entre la vista de **Esta semana**, **Este mes** y el **Mes pasado**. Ideal para revisar tu constancia a corto y largo plazo.
*   **Contador de Progreso**: Bajo el panel de días, verás un resumen claro de cuántas veces has entrenado ("12 / Días Entrenados") frente a tu **Objetivo Mensual** personalizado. ¡Tener la meta a la vista ayuda a no saltarse ni un día!
*   **Código de Colores Intuitivo**:
    *   **Verde Brillante**: ¡Misión cumplida! Indica los días que has entrenado.
    *   **Rojo Tenue**: Días pasados en los que no hubo registro (¡recupera el ritmo!).
    *   **Pulsación Azul**: Indica el día de hoy, para que sepas exactamente dónde estás.

---

## 🏋️ 2. Mejoras en el Registro de Sesión (`SessionLogger`)
El corazón de la app ahora es más robusto y "automático".

*   **Bloqueo Anti-Doble-Clic**: Al marcar una serie como finalizada ("FINALIZAR"), el botón cambia instantáneamente de rojo a verde y se bloquea. Esto evita errores de guardado duplicado y da una confirmación visual clara de que has terminado esa serie.
*   **Auto-Guardado Final**: Cuando completas la última serie de tu rutina, la app detecta que has terminado y lanza automáticamente el mensaje de felicitación y el guardado. ¡Menos botones que pulsar al final de un entreno duro!
*   **Cancelación Inteligente**: Si decides cancelar una sesión a medias, la app ahora es más lista:
    *   Si tienes series completadas, te preguntará si quieres **guardar el progreso parcial** o abandonar del todo. ¡Ningún esfuerzo se pierde!
*   **Borrado de Series**: Hemos añadido un icono de papelera en cada fila. Ahora puedes eliminar series individuales de tu sesión actual si te has equivocado o decides cambiar de plan sobre la marcha.
*   **Auto-Scroll**: Al terminar todos los sets de un ejercicio, la pantalla se deslizará suavemente hacia el siguiente ejercicio de la lista. Mantén el foco en el entreno, no en el scroll.

---

## 🎭 3. Experiencia de Usuario (UX) y Personalización
*   **Frases de Motivación**: Hemos añadido un sistema de felicitaciones variadas que cambian según el perfil del usuario (chico, chica o neutro). ¡Un poco de ánimo al terminar nunca viene mal!
*   **Traducciones Completas**: Todas las nuevas funcionalidades están disponibles tanto en **Español** como en **Inglés**.
*   **Optimización Visual**: Pequeños ajustes en márgenes y sombras para que la interfaz se sienta más Premium y moderna.

---

### 🧪 ¿Qué necesitamos de vosotros?
Por favor, prestad especial atención a:
1.  Si los **filtros de fechas** (semana/mes) muestran correctamente vuestros entrenos pasados.
2.  Si el **auto-scroll** funciona correctamente en dispositivos móviles al terminar un ejercicio.
3.  Si sentís que el **bloqueo del botón de finalizar** serie hace el uso más claro.

¡Gracias por vuestro feedback y a seguir dándole duro! 💪
