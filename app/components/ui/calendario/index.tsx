"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { AppDispatch, RootState } from "@/lib/store/store";
import Calendario from "./Calendario";
import { Booking, Room, DateRange } from "./types";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchReservasCalendar, addReserva, fetchReservas, fetchHuespedes } from "@/lib/store/utils";
import { toYMD, parseDateWithFallbackISO, diffNoches } from "@/utils/helpers/date";
import { addDays, buildBookingsFromByDate } from "./utils";
import { getCountryName } from "@/utils/helpers/format";
import { getPrecioHabitacion } from "@/utils/helpers/money";
import PopupFormAgregar from "@/components/forms/popups/PopupFormAgregar";
import { useToastAlert } from "@/hooks/useToastAlert";
import { inputBaseEstilos, labelBaseEstilos } from "@/styles/global-styles";
import makeCustomFields from "@/components/reservas/makeCustomFields";
import { EstadoReserva } from "@/models/types";
import { buildReservaFields } from "@/components/reservas/buildReservaFields";
import { Option } from "@/components/reservas/types";
import { useFormController } from "@/hooks/useFormController";
import FormRenderer from "@/components/reservas/FormRenderer";

const MS_PER_DAY = 86400000;

// ... (lo que ya tenías arriba, tipos, normalize, enrich, etc.)

export default function TimelineWithSidebarStore({
  days = 14,
  onBookingClick,
  className = "",
}: {
  days?: number;
  onBookingClick?: (id: string | number) => void;
  className?: string;
}) {
  const dispatch: AppDispatch = useAppDispatch();
  const { errorToast, successToast } = useToastAlert();

  const calendario = useAppSelector((s: RootState) => s.calendario);
  const { datos: huespedes } = useAppSelector((s: RootState) => s.huespedes);
  const { datos: habitaciones, estadosDeReserva } = useAppSelector((s: RootState) => s.habitaciones ?? { datos: [], estadosDeReserva: [] });

  // -------- rango visible (igual que tenías) ----------
  const [rangeStart, setRangeStart] = useState<Date>(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  });
  const [rangeDays, setRangeDays] = useState<number>(days);
  const rangeEnd = useMemo(() => addDays(rangeStart, rangeDays), [rangeStart, rangeDays]);
  const startStr = useMemo(() => toYMD(rangeStart), [rangeStart]);
  const endStr = useMemo(() => toYMD(addDays(rangeEnd, -1)), [rangeEnd]);

  useEffect(() => { dispatch(fetchHuespedes()); }, [dispatch]);

  
  // ===================== ROOMS derivadas del store =====================
  const rooms: Room[] = useMemo(() => {
    const arr = (habitaciones ?? []).map((h: any) => {
      const idNum = Number(h?.numero ?? h?.idHabitacion);
      return {
        id: Number.isFinite(idNum) ? idNum : String(h?.idHabitacion ?? h?.numero ?? h?.nombre ?? "NA"),
        numero: h?.numero,
        name: `Habitación ${h?.numero ?? ""}`.trim()
      } as Room;
    });
    // si no hay habitaciones en store, devolvemos vacío para que aplique fallback
    return arr.filter(Boolean).sort((a, b) => Number(a.numero) - Number(b.numero));
  }, [habitaciones]);
  

  // Fallback por si no hay rooms en el store
  const fallbackRooms: Room[] = useMemo(
    () => [
      { id: 1, name: "Habitación 1", numero: 1 },
      { id: 2, name: "Habitación 2", numero: 2 },
      { id: 3, name: "Habitación 3", numero: 3 },
    ],
    []
  );

  // ===================== FETCH calendario del store =====================
  // Si querés limitar por habitaciones, podés enviar rooms.map(r => r.id) como filtro.
  useEffect(() => {
    const habitacionesNumeros = rooms
      .map((r) => Number(r.id))
      .filter((n) => Number.isFinite(n));

    dispatch(
      fetchReservasCalendar({
        startDate: startStr,
        endDate: endStr,
        habitacionesNumeros: habitacionesNumeros.length ? habitacionesNumeros : undefined,
      })
    );
  }, [dispatch, startStr, endStr, rooms]);

  // ===================== Bookings visibles (usando datos completos del store) =====================
  const bookings: Booking[] = useMemo(() => {
    // Usar los bookings completos del store en lugar de construir desde byDate
    const storeBookings = calendario?.bookings ?? [];

    return storeBookings.map((b: any) => ({
      id: b.id,
      roomId: b.roomNumber || b.roomId, // Usar roomNumber que viene del backend
      start: b.start,
      end: b.end,
      guest: b.guest || "Sin nombre",
      price: b.price,
      status: b.status,
      rightTopLabel: b.guest,
      rightBottomLabel: b.status,
    })) as Booking[];
  }, [calendario?.bookings]);

  // helper: normaliza string|Date a medianoche local
  const toDay = (d: string | Date) => {
    const x = d instanceof Date ? d : new Date(d + (String(d).length === 10 ? "T00:00:00" : ""));
    return new Date(x.getFullYear(), x.getMonth(), x.getDate());
  };

  // Si en tu app el "end" que recibís es INCLUSIVO, pasalo como addDays(end, 1)
  const isRoomOccupiedInRange = useCallback(
    (roomId: string | number, start: Date, end: Date) => {
      // normalizar el rango consultado a día (end es EXCLUSIVO)
      const S = toDay(start);
      const E = toDay(end);

      if (!(E > S)) return false; // rango vacío o inválido

      return bookings.some((b) => {
        if (String(b.roomId) !== String(roomId)) return false;
        if (b.status === "cancelada") return false; // opcional: no bloquear por canceladas

        // normalizar booking a [bs, be) (tu data ya debería venir end-exclusive;
        // si no, sumá 1 día a 'end' acá)
        const bs = toDay(b.start);
        const be = toDay(b.end);

        // overlap de rangos [bs, be) y [S, E)
        return bs < E && be > S;
      });
    },
    [bookings]
  );

  // ===================== Range change (mantener sincronía con el header del calendario) =====================
  const handleRangeChange = useCallback(
    (start: Date, end: Date) => {
      const ns = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const newDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / MS_PER_DAY));
      const startChanged = ns.getTime() !== rangeStart.getTime();
      const daysChanged = newDays !== rangeDays;
      if (startChanged || daysChanged) {
        setRangeStart(ns);
        setRangeDays(newDays);
      }
    },
    [rangeStart, rangeDays]
  );

  // ========= FORM REUTILIZABLE =========
  const {
    formData,
    handleFormChange,
    errors,
    validateForm,
    resetForm,
    setField,
  } = useFormController(
    {
      huespedMode: "nuevo",
      idHuesped: "",
      nombre: "",
      apellido: "",
      dni: "",
      telefono: "",
      email: "",
      origen: "AR",
      idHabitacion: "",
      idEstadoReserva: "1",
      fechaDesde: "",
      fechaHasta: "",
      montoPagado: "0",
    },
    // si querés, delegá a tu zod/yup; acá dejo un mínimo
    (data) => {
      const errs: Record<string, string> = {};
      if (!data.idHabitacion) errs.idHabitacion = "Requerido";
      if (!data.fechaDesde) errs.fechaDesde = "Requerido";
      if (!data.fechaHasta) errs.fechaHasta = "Requerido";
      if (!data.idEstadoReserva) errs.idEstadoReserva = "Requerido";
      return errs;
    }
  );

  const huespedesOpts: Option[] = useMemo(
    () => (huespedes ?? []).map((h: any) => ({ value: h.idHuesped, label: `${h.nombre} ${h.apellido}` })),
    [huespedes]
  );

  const fields = useMemo(
    () => buildReservaFields(habitaciones ?? [], (estadosDeReserva ?? []) as EstadoReserva[], huespedesOpts),
    [habitaciones, estadosDeReserva, huespedesOpts]
  );

  const fieldsCalendarLocked = useMemo(
    () =>
      fields.map(f =>
        f.key === "fechaDesde" || f.key === "fechaHasta"
          ? { ...f, editable: false }
          : f
      ),
    [fields]
  );

  const customFields = useMemo(() => {
    const { origen, montoPagado } = makeCustomFields({
      labelBaseEstilos,
      inputBaseEstilos,
      habitaciones: { datos: habitaciones ?? [] },
    });
    return { origen, montoPagado };
  }, [habitaciones]);

  // Popup
  const [showCreateReservaPopup, setShowCreateReservaPopup] = useState(false);

  // Cuando seleccionan en el calendario → prellenar y abrir popup
  const handleDateRangeSelect = useCallback((range: DateRange) => {
    // Verificar si la habitación está ocupada en el rango seleccionado
    if (isRoomOccupiedInRange(range.roomId, range.start, range.end)) {
      errorToast("No se puede crear una reserva en una habitación que ya está ocupada en el rango seleccionado.");
      return;
    }

    const ddmmyyyy = (d: Date) => {
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      return `${day}/${month}/${d.getFullYear()}`;
    };

    // Buscar la habitación por número para obtener el ID correcto
    const habitacion = habitaciones?.find(h => h.numero === Number(range.roomId));
    const habitacionId = habitacion?.idHabitacion || range.roomId;

    setField("idHabitacion", String(habitacionId));
    setField("fechaDesde", ddmmyyyy(range.start));
    setField("fechaHasta", ddmmyyyy(addDays(range.end, -1))); // end exclusive → inclusive
    setShowCreateReservaPopup(true);
  }, [setField, isRoomOccupiedInRange, errorToast, habitaciones]);

  // Guardar reserva
  const handleCreateReserva = useCallback(async (fd: Record<string, unknown>) => {
    const {
      huespedMode, idHuesped,
      nombre, apellido, dni, telefono, email, origen,
      idHabitacion, idEstadoReserva, fechaDesde, fechaHasta, montoPagado
    } = fd;

    const countryName = getCountryName(String(origen || "AR"), "es");
    const precioPorDia = getPrecioHabitacion({ datos: habitaciones }, idHabitacion);
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
        email: String(email || ""),
        origen: countryName,
      };
      if (idHuesped) payload.idHuesped = Number(idHuesped);
    }

    try {
      await dispatch(addReserva(payload)).unwrap();
      await dispatch(fetchReservas());
      successToast("Reserva creada exitosamente.");
      setShowCreateReservaPopup(false);
      resetForm();
    } catch (err) {
      errorToast(typeof err === "string" ? err : "Error al crear reserva.");
    }
  }, [dispatch, habitaciones, successToast, errorToast, resetForm]);

  return (
    <section className={["w-full", className].join(" ")}>
      <Calendario
        rooms={rooms.length ? rooms : fallbackRooms}
        bookings={bookings}
        days={rangeDays}
        onRangeChange={handleRangeChange}
        onBookingClick={onBookingClick}
        onDateRangeSelect={handleDateRangeSelect}
        showSelection={true}
      />

      {/* Popup usando el mismo renderer */}
      <PopupFormAgregar
        isOpen={showCreateReservaPopup}
        title="Crear Nueva Reserva"
        defaultData={formData}
        onClose={() => { setShowCreateReservaPopup(false); resetForm(); }}
        onSave={() => { if (!validateForm()) return; handleCreateReserva(formData); }}
        validateForm={validateForm}
        hasErrors={Object.keys(errors).length > 0}
      >
        {() => (
          <FormRenderer
            fields={fieldsCalendarLocked}
            formData={formData}
            onChange={handleFormChange}
            errors={errors}
            mode="add"
            customFields={customFields}
          />
        )}
      </PopupFormAgregar>
    </section>
  );
}
