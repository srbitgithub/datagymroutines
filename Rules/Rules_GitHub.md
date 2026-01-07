# Reglas de Gestión de Repositorio (GitHub Strategy)

**Descripción:** Protocolo para la actualización del repositorio, asegurando la integridad del código y un historial de versiones limpio y profesional.
**Principio Fundamental:** "Unidad de Trabajo Completa". No se permiten commits parciales, micro-commits o estados "WIP" (Work In Progress) en la rama principal.

## 1. Política de Commit Único por Tarea

* **Prohibición de Commits Atómicos:** El asistente **no** debe realizar commits pequeños por cada archivo o capa modificada.
* **Finalización Obligatoria:** Solo se realizará el commit cuando la tarea solicitada esté terminada al 100%. Esto incluye:
* El código de todas las capas afectadas (Domain, Application, Infrastructure, UI).
* La documentación necesaria (si aplica).
* Los tests asociados a la funcionalidad.



## 2. Definición de "Tarea Finalizada" (DoD)

Antes de ejecutar cualquier comando de `git commit`, el asistente debe verificar:

1. **Integridad Arquitectónica:** Que el flujo entre las capas (Hexagonal/Clean) esté completo y desacoplado.
2. **Validación de Tipos:** Que el comando `npm run tsc` (o equivalente) no devuelva errores.
3. **Linting:** Que el código cumpla con las reglas estéticas y de calidad (`npm run lint`).
4. **Build Local:** Que el comando `next build` finalice con éxito, garantizando que el despliegue en Vercel no fallará.
5. **Pruebas:** Que los tests unitarios y de integración (Vitest) estén en verde.

## 3. Estándar de Mensajes (Conventional Commits)

Los mensajes de commit deben ser descriptivos y seguir el estándar profesional:

* **Formato:** `tipo(alcance): descripción breve en minúsculas`
* **Tipos permitidos:**
* `feat`: Nueva funcionalidad completa (ej: `feat(auth): implement password recovery flow`).
* `fix`: Corrección de un error.
* `refactor`: Cambios en el código que no añaden funcionalidad (ej: reestructurar capas).
* `test`: Adición o modificación de pruebas.
* `docs`: Cambios en la documentación.


* **Cuerpo del mensaje:** Si la tarea es compleja, el mensaje debe incluir una lista breve de los cambios realizados en cada capa.

## 4. Procedimiento de Actualización

Cuando el usuario solicite una tarea, el flujo del asistente será:

1. Desarrollar la lógica en todas las capas (Domain -> App -> Infra -> React).
2. Realizar las verificaciones técnicas (Build/Test).
3. **Realizar UN SOLO commit** que agrupe todos los cambios de la tarea.
4. Hacer el `push` a la rama correspondiente.
5. Informar al usuario del éxito de la operación y proporcionar el hash o link del commit.

## 5. Control de Conflictos

* Antes de realizar el push, el asistente debe asegurarse de estar sincronizado con la rama remota (`git pull --rebase`) para evitar conflictos innecesarios o commits de "merge" que ensucien el historial.

---

### Ejemplo de flujo esperado:

> **Usuario:** "Añade el campo 'bio' al perfil del usuario, incluyendo base de datos y UI."
> **Asistente:** *(Modifica la entidad en Domain, el Caso de Uso en Application, el Adapter de Supabase en Infrastructure y el componente React. Ejecuta el build).*
> **Asistente (Consola):** > `git add .`
> `git commit -m "feat(users): add biography field to user profile including database persistence and UI"`
> `git push origin main`
> **Asistente (Respuesta):** "He finalizado la tarea. Se ha actualizado el perfil de usuario en todas las capas y se ha subido el cambio al repositorio con un único commit funcional."
