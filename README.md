# Frontend - Posada Dormis

Cliente web para operacion administrativa y flujo publico de reservas.

## Responsabilidad del modulo

- Renderizar vistas administrativas y publicas.
- Consumir endpoints del backend.
- Gestionar estado de UI y datos en cliente.
- Ofrecer validaciones y feedback de usuario.

## Stack

- Next.js 15 (App Router)
- React 19
- Redux Toolkit
- Axios
- Tailwind CSS

## Requisitos

- Node.js 18 o superior
- Backend activo y accesible

## Variables de entorno

Crear `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Ejecucion

```bash
cd frontend
npm install
npm run dev
```

Aplicacion en `http://localhost:3000`.

## Scripts

- `npm run dev`: desarrollo.
- `npm run build`: build de produccion.
- `npm run start`: ejecutar build.
- `npm run lint`: chequeo estatico.

## Estructura del codigo

- `app/(routes)`: paginas por dominio funcional.
- `app/components`: componentes reutilizables.
- `app/lib/store`: redux store y slices.
- `app/hooks`: hooks personalizados.
- `app/models/types`: contratos de tipos.
- `app/utils`: validaciones y helpers.

## Funcionalidades destacadas

- Autenticacion y control de sesion.
- Gestion CRUD de habitaciones, tipos, huespedes y reservas.
- Vista de calendario y estados operativos.
- Flujo publico de solicitud con confirmacion por email.

## Consideraciones para tesis

- Interfaz desacoplada de la API.
- Estado global para consistencia entre modulos.
- Validaciones de formularios y mensajes de error en acciones criticas.
- Base de componentes reutilizable para escalabilidad.
