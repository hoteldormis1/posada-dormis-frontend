// global-styles.ts

// Pantalla principal
export const pantallaPrincipalEstilos =
  'bg-background w-full min-h-full overflow-auto';

// Títulos principales
export const fuenteDeTitulo =
  'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-center block sm:pb-4';

// Subtítulos
export const fuenteDeSubtitulo = 'text-2xl font-semibold';

// Input base
export const inputBaseEstilos =
  'block w-full text-sm rounded-lg bg-[var(--color-light)] border-2 border-gray-300 ' +
  'placeholder-[var(--color-muted)] text-[var(--color-text)] ' +
  'focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:border-[var(--color-main)] ' +
  'px-4 py-2.5 transition-all duration-200 ' +
  'hover:border-gray-400 ' +
  'dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white ' +
  'dark:focus:ring-[var(--color-main-light)] dark:focus:border-[var(--color-main-light)]';

// Input con error
export const inputErrorEstilos =
  'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50 ' +
  'dark:focus:ring-red-500 dark:focus:border-red-500 dark:bg-red-900/20';

// Label base
export const labelBaseEstilos =
  'block mb-2 text-sm font-semibold text-gray-700 dark:text-white';

// Mensaje de error
export const mensajeErrorEstilos = 'text-red-600 text-xs mt-1.5 font-medium flex items-center gap-1';
