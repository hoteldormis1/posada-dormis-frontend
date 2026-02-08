"use client";

import React, { useEffect, useMemo } from "react";
import { inputBaseEstilos, labelBaseEstilos, pantallaPrincipalEstilos } from "@/styles/global-styles";
import { LoadingSpinner, TableComponent } from "@/components";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { AppDispatch, RootState } from "@/lib/store/store";
import { addReserva, deleteReserva, editReserva, fetchHuespedes, fetchReservas } from "@/lib/store/utils/index";
import { useToastAlert } from "@/hooks/useToastAlert";
import { EstadoReserva, Habitacion, Reserva, SortOrder, StateStatus } from "@/models/types";
import { fetchHabitaciones } from "@/lib/store/utils/habitaciones/habitacionesSlice";
import { useSweetAlert } from "@/hooks/useSweetAlert";
import { reservaAddSchema, reservaEditSchema } from "@/utils/validations/reservaSchema";
import { mapRowToFormDataReservas } from "@/utils/helpers/mappers";
import { getCountryName } from "@/utils/helpers/format";
import { diffNoches, toISOFromFlexible, parseDateWithFallbackISO } from "@/utils/helpers/date";
import { getPrecioHabitacion } from "@/utils/helpers/money";
import makeCustomFields from "@/components/reservas/makeCustomFields";
import { hasPermission } from "@/utils/helpers/permissions";
import { Huesped } from "@/models/types/huesped";
import { buildReservaFields } from "@/components/reservas/buildReservaFields";
import { Option } from "@/components/reservas/types";

const Reservas: React.FC = () => {
  const dispatch = useAppDispatch<AppDispatch>();
  const { reservas, status } = useAppSelector((state: RootState) => state.reservas);
  const { datos: huespedes } = useAppSelector((state: RootState) => state.huespedes);
  const { habitaciones } = useAppSelector((state: RootState) => state);
  const EstadoReservas = useAppSelector((state: RootState) => state.habitaciones.estadosDeReserva);

  const { errorToast, successToast } = useToastAlert();
  const { confirm } = useSweetAlert();

  const columns = [
    { header: "Habitación", key: "numeroHab" },
    { header: "Fecha de ingreso", key: "ingreso" },
    { header: "Fecha de salida", key: "egreso" },
    { header: "Huésped", key: "huespedNombre" },
    { header: "Teléfono", key: "telefonoHuesped" },
    { header: "Monto pagado", key: "montoPagado" },
    { header: "Total", key: "total" },
    { header: "Estado", key: "estadoDeReserva" },
  ];

  const { accessToken } = useAppSelector((state: RootState) => state.user);

  // Carga al montar - siempre refetchea para tener datos actualizados
  useEffect(() => {
    if (!accessToken) return;

    dispatch(fetchHabitaciones({ sortOrder: SortOrder.asc }));
    dispatch(fetchReservas());
    dispatch(fetchHuespedes());
  }, [dispatch, accessToken]);

  const data = useMemo(() => reservas, [reservas]);

  // ✅ opciones de huéspedes para el builder
  const huespedesOpts: Option[] = useMemo(
    () =>
      (huespedes ?? []).map((h: Huesped) => ({
        value: h.idHuesped,
        label: `${h.nombre} ${h.apellido}`,
      })),
    [huespedes]
  );

  // ✅ habitaciones ordenadas por número para un UX consistente
  const habitacionesOrdenadas: Habitacion[] = useMemo(() => {
    const arr = (habitaciones?.datos ?? []) as Habitacion[];
    return [...arr].sort((a, b) => Number(a.numero) - Number(b.numero));
  }, [habitaciones?.datos]);

  // ✅ campos del formulario con el builder reutilizable
  const inputOptions = useMemo(
    () => buildReservaFields(habitacionesOrdenadas, (EstadoReservas ?? []) as EstadoReserva[], huespedesOpts),
    [habitacionesOrdenadas, EstadoReservas, huespedesOpts]
  );

  // ✅ custom fields (Origen, MontoPagado)
  const customFields = useMemo(() => {
    const { origen, montoPagado } = makeCustomFields({
      labelBaseEstilos,
      inputBaseEstilos,
      habitaciones,
    });
    return { origen, montoPagado } as const;
  }, [habitaciones]);

  const onSaveEdit = async (updatedRow: any) => {
    try {
      const payload: any = {
        id: String(updatedRow.id),
        idEstadoReserva:
          updatedRow.idEstadoReserva !== undefined ? Number(updatedRow.idEstadoReserva) : undefined,
        fechaDesde: toISOFromFlexible(updatedRow.fechaDesde),
        fechaHasta: toISOFromFlexible(updatedRow.fechaHasta),
        montoPagado:
          updatedRow.montoPagado !== undefined ? Number(updatedRow.montoPagado) : undefined,
      };

      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

      await dispatch(editReserva(payload)).unwrap();
      await dispatch(fetchReservas());
      successToast("Reserva actualizada correctamente.");
    } catch (err) {
      errorToast(typeof err === "string" ? err : "Ocurrió un error al actualizar la reserva.");
    }
  };

  const onSaveAdd = async (formData: Record<string, unknown>) => {
    const {
      huespedMode, idHuesped,
      nombre, apellido, dni, telefono, origen,
      idHabitacion, idEstadoReserva, fechaDesde, fechaHasta, montoPagado
    } = formData;

    const countryName = getCountryName(String(origen || "AR"), "es");

    const precioPorDia = getPrecioHabitacion(habitaciones, idHabitacion);
    const noches = diffNoches(String(fechaDesde), String(fechaHasta));
    const montoTotal = precioPorDia * noches;
    const pagadoNum = Number(montoPagado) || 0;
    const montoPagadoSeguro = Math.min(pagadoNum, montoTotal);

    const payload: any = {
      idHabitacion: Number(idHabitacion),
      idEstadoReserva: Number(idEstadoReserva),
      fechaDesde: parseDateWithFallbackISO(String(fechaDesde)),
      fechaHasta: parseDateWithFallbackISO(String(fechaHasta)),
      montoPagado: montoPagadoSeguro,
    };

    if (huespedMode === "existente") {
      payload.idHuesped = Number(idHuesped);
    } else {
      payload.huesped = {
        nombre: String(nombre || ""),
        apellido: String(apellido || ""),
        dni: String(dni || ""),
        telefono: String(telefono || ""),
        origen: countryName,
      };
      if (idHuesped) {
        payload.idHuesped = Number(idHuesped);
      }
    }

    try {
      await dispatch(addReserva(payload)).unwrap();
      await dispatch(fetchReservas());
      successToast("Reserva creada exitosamente.");
    } catch (err) {
      errorToast(typeof err === "string" ? err : "Error al crear reserva.");
    }
  };

  const onSaveDelete = async (id: string) => {
    try {
      const confirmed = await confirm("Esta acción no se puede deshacer.");
      if (!confirmed) return;
      await dispatch(deleteReserva(id)).unwrap();
      successToast("Reserva eliminada exitosamente.");
    } catch (err) {
      errorToast(typeof err === "string" ? err : "Error al eliminar la reserva.");
    }
  };

  const { currentUser, tiposUsuarios } = useAppSelector((state: RootState) => state.user);
  const idTipoUsuarioActual = currentUser?.idTipoUsuario;
  const puedeBorrar = hasPermission(tiposUsuarios, idTipoUsuarioActual, "reserva", "delete");
  const puedeEditar = hasPermission(tiposUsuarios, idTipoUsuarioActual, "reserva", "update");
  const puedeAgregar = hasPermission(tiposUsuarios, idTipoUsuarioActual, "reserva", "create");

  return (
    <div className={pantallaPrincipalEstilos}>
      <div className="w-11/12 sm:w-10/12 md:w-9/12 xl:w-8/12 m-auto">
        {(() => {
          if (status === StateStatus.loading) return <LoadingSpinner />;
          if (status === StateStatus.failed)
            return <p className="text-center mt-10 text-red-600">Ocurrió un error al cargar las reservas.</p>;

          return (
            <TableComponent<Reserva>
              title="Reservas"
              columns={columns}
              data={data}
              showFormActions
              onSaveEdit={onSaveEdit}
              onSaveAdd={onSaveAdd}
              onSaveDelete={onSaveDelete}
              // 👇 ahora el form viene del builder reutilizable
              inputOptions={inputOptions}
              // 👇 y los custom fields compartidos
              customFields={customFields}
              validationSchemaEdit={reservaEditSchema}
              validationSchemaAdd={reservaAddSchema}
              mapRowToFormData={mapRowToFormDataReservas}
              showActions={{ create: false, delete: puedeBorrar, edit: puedeEditar }}
            />
          );
        })()}
      </div>
    </div>
  );
};

export default Reservas;
