// global-styles.ts

// Pantalla principal
export const pantallaPrincipalEstilos =
  'w-full min-h-full overflow-auto';

// Títulos principales
export const fuenteDeTitulo =
  'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-center block sm:pb-4 admin-title';

// Subtítulos
export const fuenteDeSubtitulo = 'text-2xl font-semibold';

// Input base
export const inputBaseEstilos =
  'admin-input block w-full text-[15px] rounded-xl bg-white/6 border border-white/15 ' +
  'text-admin-primary ' +
  'focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] focus:border-[var(--color-main)] ' +
  'px-4 py-2.5 transition-all duration-200 ' +
  'hover:border-white/30 hover:bg-white/8';

// Input con error
export const inputErrorEstilos =
  'border-red-400/70 focus:ring-red-500 focus:border-red-500 bg-red-500/10';

// Label base
export const labelBaseEstilos =
  'block mb-2 text-[15px] font-semibold text-admin-muted';

// Mensaje de error
export const mensajeErrorEstilos = 'text-red-300 text-xs mt-1.5 font-medium flex items-center gap-1';

export const adminCardEstilos =
  'admin-glass-card p-5 sm:p-6';

export const adminCardSoftEstilos =
  'admin-glass-card-soft p-4 sm:p-5';

export const adminPrimaryButtonEstilos =
  'admin-button-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 shadow-[0_8px_20px_rgba(16,185,129,0.22)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

export const adminGhostButtonEstilos =
  'admin-button-ghost inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
