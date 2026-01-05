# Reglas de Ingeniería: Testing en Next.js 15 (App Router & Supabase)

**Descripción:** Estándares para pruebas unitarias, de integración y E2E optimizados para React 19 y Next.js 15.
**Archivos:** `/tests/**/*`, `**/*.test.{ts,tsx}`, `vitest.config.ts`, `playwright.config.ts`

## 1. Estrategia de Herramientas (Tech Stack)

* **Unitarias/Integración:** [Vitest](https://vitest.dev/) + React Testing Library + `@testing-library/react@alpha` (para soporte React 19).
* **E2E / Browser Testing:** [Playwright](https://playwright.dev/).
* **Mocking de API:** **MSW 2.0** (Mock Service Worker) para interceptar peticiones nativas de `fetch` tanto en Server Components como en Cliente.
* **Supabase Testing:** Utilizar el **Supabase CLI** para bases de datos locales en pruebas E2E y `vi.mock` para el cliente de Supabase en pruebas unitarias.

## 2. Organización y Colocación (Colocation)

* **Regla:** Los tests de componentes y lógica de negocio deben vivir junto al archivo fuente (`colocation`).
* **Estructura:**
* `component.tsx` -> `component.test.tsx`
* `lib/utils.ts` -> `lib/utils.test.ts`


* **Excepción:** Los tests E2E y de flujo completo deben residir en una carpeta `/tests/e2e` en la raíz del proyecto.

---

## 3. Pruebas en React Server Components (RSC)

Dado que Vitest no ejecuta el entorno de servidor de Next.js, sigue estas reglas:

* **Lógica de Datos:** Extrae la lógica de fetching a funciones independientes y pruébalas como unidades asíncronas.
* **Mocks de Next.js 15:** Las APIs de `next/headers` y `next/navigation` ahora son **asíncronas**.
* **Ejemplo de Mock para Headers (Next 15):**
```typescript
vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-test': 'value' }),
  cookies: async () => ({
    get: vi.fn().mockReturnValue({ value: 'session-token' }),
  }),
}));

```



## 4. Testing de Server Actions

Las Server Actions deben probarse tanto en aislamiento como en su integración con la UI:

* **Aislamiento:** Importa la acción directamente en Vitest y verifica el retorno (usualmente objetos validados por Zod).
* **Integración:** Usa Playwright para verificar que el formulario muestra el estado de "cargando" y procesa la respuesta correctamente usando `useActionState` (React 19).
* **Seguridad:** Incluye siempre un caso de prueba donde el usuario no tiene sesión (simular `null` en el mock de Supabase) para verificar que la acción lanza un error 401.

## 5. Mocking de Supabase (Unit & Integration)

Para evitar llamadas reales a la API de Supabase en Vitest:

* **Mock Global:** Crea un archivo `tests/setup.ts` que haga mock de `@supabase/supabase-js`.
* **Patrón de respuesta:**
```typescript
export const supabaseMock = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { id: '1', name: 'Test' }, error: null }),
  })),
};

```



---

## 6. Estándares de Código y Accesibilidad

* **Queries:** Prohibido usar `testId` a menos que el elemento sea dinámico o inaccesible.
* *Prioridad:* `getByRole` > `getByLabelText` > `getByPlaceholderText`.


* **React 19 `act`:** En Next.js 15/React 19, ya no es necesario envolver manualmente la mayoría de los renders en `act()`, ya que Testing Library lo maneja internamente.
* **Limpieza:** Usar `afterEach(() => vi.clearAllMocks())` para evitar fugas de estado entre pruebas.

## 7. Configuración de Playwright (E2E)

* **Base URL:** Usar `http://localhost:3000`.
* **Auth State:** Guarda el estado de autenticación de Supabase en un archivo `.auth/user.json` para evitar loguearse en cada prueba individual.
* **Visual Regression:** Solo para componentes críticos (Botones de pago, Navbars).

---

## 8. Cobertura y CI/CD

* **Umbral de Cobertura:** Configurar Vitest para fallar si la cobertura total es inferior al **80%** (opcional según el proyecto).
* **Vercel Preview:** Configurar Playwright para que se ejecute contra las `preview-url` de Vercel en cada Pull Request.
