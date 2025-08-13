// global-styles.ts

// Pantalla principal
export const pantallaPrincipalEstilos =
  'bg-[var(--color-background)] w-full min-h-screen overflow-auto pt-30 pb-40 px-4';

// Títulos principales
export const fuenteDeTitulo =
  'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-center block sm:pb-4';

// Subtítulos
export const fuenteDeSubtitulo = 'text-2xl font-semibold';

// Input base
export const inputBaseEstilos =
  'block w-full text-sm rounded-sm bg-[var(--color-light)] border border-[var(--color-border)] ' +
  'placeholder-[var(--color-muted)] text-[var(--color-text)] ' +
  'focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:border-[var(--color-main)] ' +
  'px-4 py-2 ' +
  'dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white ' +
  'dark:focus:ring-[var(--color-main-light)] dark:focus:border-[var(--color-main-light)]';

// Input con error
export const inputErrorEstilos =
  'border-[var(--color-danger)] focus:ring-[var(--color-danger)] focus:border-[var(--color-danger)] ' +
  'dark:focus:ring-[var(--color-danger)] dark:focus:border-[var(--color-danger)]';

// Label base
export const labelBaseEstilos =
  'block mb-2 text-sm font-medium text-[var(--color-text)] dark:text-white';

// Mensaje de error
export const mensajeErrorEstilos = 'text-red-500 text-xs mt-1';
