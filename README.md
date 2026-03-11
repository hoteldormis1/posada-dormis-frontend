# Frontend - Sistema de Reservas

Aplicacion web administrativa y publica para gestion de reservas.

## Stack

- Next.js 15 (App Router)
- React 19
- Redux Toolkit
- Axios
- Tailwind CSS

## Requisitos

- Node.js 18+
- Backend en ejecucion

## Variables de entorno

Crear `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Instalacion y ejecucion

```bash
cd frontend
npm install
npm run dev
```

App disponible en `http://localhost:3000`.

## Scripts

- `npm run dev`: modo desarrollo.
- `npm run build`: build de produccion.
- `npm run start`: ejecutar build.
- `npm run lint`: analisis estatico.

## Estructura

- `app/(routes)`: paginas por modulo.
- `app/components`: componentes UI y formularios.
- `app/lib/store`: slices y estado global.
- `app/utils`: validaciones y helpers.

## Funcionalidades

- Login y manejo de sesion.
- ABM de habitaciones, tipos, huespedes y reservas.
- Calendario de ocupacion.
- Flujo publico de solicitud de reserva.

## Enfoque para tesis

- Frontend desacoplado del backend mediante API REST.
- Estado compartido para consistencia entre vistas.
- Validacion de formularios y feedback de usuario en acciones criticas.
