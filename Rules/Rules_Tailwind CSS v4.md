# Reglas de Ingeniería: Tailwind CSS v4 (Oxide Engine)

**Descripción:** Estándares para el desarrollo de interfaces utilizando Tailwind CSS v4 con enfoque "CSS-first" y motor Oxide.
**Archivos afectados:** `**/*.{css,ts,tsx,jsx,js,mdx}`

## 1. Paradigma "CSS-First" (Adiós al JS de Configuración)

* **Regla:** Queda prohibido el uso de `tailwind.config.js` o `tailwind.config.ts`. Toda la personalización debe residir en el archivo CSS global (ej. `app/globals.css`).
* **Punto de Entrada:** El archivo debe comenzar exclusivamente con:
```css
@import "tailwindcss";

```



## 2. Configuración del Tema (@theme)

* **Tokens de Diseño:** Define colores, fuentes y espaciados dentro del bloque `@theme`.
* **Variables CSS Nativas:** Tailwind v4 mapea automáticamente las variables `--*` a utilidades.
* **Ejemplo de Estructura:**
```css
@theme {
  --font-sans: 'Inter', ui-sans-serif, system-ui;
  --color-brand-primary: oklch(0.62 0.17 256.4);
  --color-brand-secondary: oklch(0.45 0.12 300);
  --breakpoint-3xl: 1920px;
}

```



## 3. Registro de Utilidades y Componentes

* **@utility:** Utiliza esta directiva para crear clases personalizadas que necesiten variantes (como `hover:` o `dark:`).
```css
@utility btn-primary {
  @apply bg-brand-primary px-4 py-2 rounded-lg transition-colors;
  &:hover {
    @apply bg-brand-secondary;
  }
}

```


* **Anidamiento Nativo:** No uses preprocesadores (Sass/Less). El motor Oxide soporta anidamiento de CSS estándar de forma nativa y eficiente.

## 4. Gestión de Contenido y Escaneo (@source)

* **Detección Automática:** Tailwind v4 detecta los archivos en el proyecto automáticamente.
* **Excepciones:** Usa `@source` solo si necesitas incluir archivos en `node_modules` o rutas fuera del directorio raíz:
```css
@source "../../packages/ui/src";

```



## 5. Estándares de Diseño Moderno

* **Espacio de Color:** Prioriza el uso de **OKLCH** para definir colores, aprovechando la mejor gestión de brillo y gamas en pantallas modernas.
* **Container Queries:** Sustituye los media queries de pantalla (`sm:`, `md:`) por utilidades de contenedor (`@container`) cuando diseñes componentes modulares e independientes.
* **Logical Properties:** Prioriza `ms-*` (margin-start) y `me-*` (margin-end) sobre `ml-*` y `mr-*` para soporte nativo de lectura LTR/RTL.

## 6. Orden y Limpieza (Metodología "Outside-In")

Al escribir clases en los componentes (JSX/TSX), el orden debe ser:

1. **Posicionamiento** (`relative`, `absolute`, `top-0`, `z-10`).
2. **Modelo de Caja / Layout** (`flex`, `grid`, `m-4`, `p-2`, `w-full`).
3. **Tipografía** (`text-lg`, `font-bold`, `leading-tight`).
4. **Estilos Visuales** (`bg-white`, `shadow-md`, `rounded-xl`, `border`).
5. **Interactividad/Estados** (`hover:`, `focus:`, `disabled:`).

## 7. Integración con Next.js App Router

* **Importación Global:** Asegúrate de importar el CSS principal únicamente en `app/layout.tsx`.
* **Zero-Runtime:** Recuerda que Tailwind v4 es un compilador en tiempo de construcción. No intentes manipular el objeto de configuración en tiempo de ejecución.
