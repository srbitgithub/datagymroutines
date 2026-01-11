# Reglas de Gestión de Repositorio (GitHub Strategy)

**Descripción:** Protocolo para la actualización del repositorio, asegurando la integridad del código y un historial de versiones limpio y profesional.
**Principio Fundamental:** Está prohibido hacer cualquier tipo de commit hasta que el usuario lo solicite.


## 1. Estándar de Mensajes (Conventional Commits)

Los mensajes de commit deben ser descriptivos y seguir el estándar profesional:

* **Formato:** `tipo(alcance): descripción breve en minúsculas`
* **Tipos permitidos:**
* `feat`: Nueva funcionalidad completa (ej: `feat(auth): implement password recovery flow`).
* `fix`: Corrección de un error.
* `refactor`: Cambios en el código que no añaden funcionalidad (ej: reestructurar capas).
* `test`: Adición o modificación de pruebas.
* `docs`: Cambios en la documentación.


* **Cuerpo del mensaje:** Si la tarea es compleja, el mensaje debe incluir una lista breve de los cambios realizados en cada capa.

## 2. Procedimiento de Actualización

Cuando el usuario solicite una tarea, el flujo del asistente será:

1. Desarrollar la lógica en todas las capas (Domain -> App -> Infra -> React).
2. Realizar las verificaciones técnicas (Build/Test).
3. **No realizar ningún commit**
4. **No realizar ningún push**
5. Hacer un commit cuando el usuario solicite que se haga.
6. Hacer el `push` a la rama correspondiente cuando el usuario solicite que se haga.
7. Informar al usuario del éxito de la operación y proporcionar el hash o link del commit.

## 3. Control de Conflictos

* Antes de realizar el push, el asistente debe asegurarse de estar sincronizado con la rama remota (`git pull --rebase`) para evitar conflictos innecesarios o commits de "merge" que ensucien el historial.

---

### Ejemplo de flujo esperado:

> **Usuario:** "Añade el campo 'bio' al perfil del usuario, incluyendo base de datos y UI."
> **Asistente:** *(Modifica la entidad en Domain, el Caso de Uso en Application, el Adapter de Supabase en Infrastructure y el componente React. Ejecuta el build).*
> **Asistente (Consola):** > `git add .`
> `git commit -m "feat(users): add biography field to user profile including database persistence and UI"`
> `git push origin main`
> **Asistente (Respuesta):** "He finalizado la tarea. Se ha actualizado el perfil de usuario en todas las capas y se ha subido el cambio al repositorio con un único commit funcional."

