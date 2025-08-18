/**
 * Verifica si un tipo de usuario tiene un permiso específico en un módulo.
 *
 * @param tiposUsuarios Lista de tipos de usuarios (con permisos).
 * @param idTipoUsuario ID del tipo de usuario a verificar.
 * @param modulo Nombre del módulo (ej: "usuario", "reserva").
 * @param accion Acción a verificar (ej: "delete", "read").
 * @returns true si el permiso existe, false en caso contrario.
 */
export function hasPermission(
    tiposUsuarios: any[],
    idTipoUsuario: number,
    modulo: string,
    accion: string
  ): boolean {
    return !!tiposUsuarios
      .find((t) => t.idTipoUsuario === idTipoUsuario)
      ?.permisos?.find((p: any) => p.modulo === modulo)
      ?.acciones?.includes(accion);
  }
  