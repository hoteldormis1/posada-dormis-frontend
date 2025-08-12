# Validaciones Zod en el Sistema

Este directorio contiene las validaciones Zod para los formularios del sistema.

## Estructura

- `reservaSchema.ts` - Esquemas de validación para reservas
- `habitacionSchema.ts` - Esquemas de validación para habitaciones
- `useZodValidation.ts` - Hook personalizado para manejar validaciones Zod

## Esquemas Disponibles

### Reservas

```typescript
import { reservaAddSchema, reservaEditSchema } from "@/utils/validations/reservaSchema";

// Para formularios de agregar
const addValidation = reservaAddSchema;

// Para formularios de editar
const editValidation = reservaEditSchema;
```

### Habitaciones

```typescript
import { habitacionAddSchema, habitacionEditSchema } from "@/utils/validations/habitacionSchema";

// Para formularios de agregar
const addValidation = habitacionAddSchema;

// Para formularios de editar
const editValidation = habitacionEditSchema;
```

## Uso en Componentes

### 1. En TableComponent

```typescript
import { reservaAddSchema, reservaEditSchema } from "@/utils/validations/reservaSchema";

<TableComponent<Reserva>
  // ... otras props
  validationSchema={reservaEditSchema}      // Para edición
  validationSchemaAdd={reservaAddSchema}    // Para agregar
/>
```

### 2. En Hooks Personalizados

```typescript
import { useZodValidation } from "@/hooks/useZodValidation";
import { reservaAddSchema } from "@/utils/validations/reservaSchema";

const { errors, validate, clearErrors } = useZodValidation(reservaAddSchema);

// Validar formulario
const isValid = validate(formData);

// Mostrar errores
console.log(errors);
```

### 3. En Formularios

Los errores se muestran automáticamente en los campos de entrada:

```typescript
<DynamicInputField
  inputKey="nombre"
  inputType="text"
  label="Nombre"
  value={formData.nombre}
  onChange={handleChange}
  error={errors.nombre} // Se muestra automáticamente
/>
```

## Campos Validados

### Reservas

- **nombre**: Requerido, string
- **apellido**: Requerido, string
- **dni**: Mínimo 6 caracteres
- **telefono**: Mínimo 6 caracteres
- **email**: Email válido (opcional)
- **origen**: Requerido, string
- **idHabitacion**: Número entero positivo
- **fechaDesde**: Fecha requerida
- **fechaHasta**: Fecha requerida, debe ser posterior a fechaDesde
- **montoPagado**: Número no negativo

### Habitaciones

- **numero**: Número entero positivo
- **tipo**: String requerido
- **capacidad**: Número entero mínimo 1
- **precio**: Número no negativo
- **descripcion**: String opcional

## Validaciones Personalizadas

### Validación de Fechas

```typescript
.refine(
  (v) => v.fechaHasta >= v.fechaDesde,
  { path: ["fechaHasta"], message: "La salida debe ser posterior al ingreso" }
);
```

## Manejo de Errores

Los errores se muestran automáticamente:

1. **En tiempo real**: Los errores se limpian cuando el usuario empieza a escribir
2. **Al enviar**: Se validan todos los campos antes de enviar el formulario
3. **Visual**: Los campos con errores se resaltan en rojo
4. **Mensajes**: Se muestran mensajes de error específicos debajo de cada campo

## Crear Nuevos Esquemas

Para crear un nuevo esquema de validación:

1. Crear el archivo en `utils/validations/`
2. Definir el esquema Zod
3. Exportar los tipos TypeScript
4. Usar en los componentes correspondientes

```typescript
import { z } from "zod";

export const miEsquema = z.object({
  campo: z.string().min(1, "Requerido"),
  // ... más campos
});

export type MiFormType = z.infer<typeof miEsquema>;
```

## Integración Completa

La validación está integrada en toda la cadena de componentes:

1. **TableComponent** recibe los esquemas de validación
2. **useEditPopup** y **useAddPopup** manejan la validación
3. **TableButtons** muestra los errores
4. **DynamicInputField** resalta campos con errores
5. **PopupFormAgregar** y **PopupFormEditar** validan antes de guardar
